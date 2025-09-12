const nodemailer = require("nodemailer");
const pool = require("../connection");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_SENDER,
    pass: process.env.PASSWORD_SENDER,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("Error Verifying Transporter", error);
  } else {
    console.log("Transporter verified");
  }
});

transporter.on("error", (err) => {
  console.error("Nodemailer Error", err.message);
});

const generateOTP = () => Math.floor(100000 + Math.random() * 900000);

async function sendOTP(req, res) {
  const { email, dealership_id,id } = req.body;

  try {
    const otp = generateOTP();

    const info = await transporter.sendMail({
      from: process.env.EMAIL_SENDER,
      to: email,
      subject: "Hello Dealer Principal",
      text: `Your OTP for the bbnd stock verification is ${otp}`, // plain‑text body
    });
    try {
      const response = await pool.query(
        `INSERT INTO bbnd_otps (OTP,dealership_id,deleted_bbnd_inventory_id) values($1,$2,$3)`,
        [otp, dealership_id,id]
      );
      return res.json({ msg: `Email Sent` });
    } catch (error) {
      console.log(error);
      return res.json({ msg: "Error Sending otp" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error Sending otp" });
  }
}

async function VerifyOTP(req, res) {
  const { otp, dealership_id } = req.body;

  try {
    const response = await pool.query(
      `Select otp,id from bbnd_otps where dealership_id = $1 ORDER BY id desc LIMIT 1`,
      [dealership_id]
    );

    const otpStored = response.rows[0].otp;
    const id = response.rows[0].id
  
    if (parseInt(otp) === parseInt(otpStored)) {
      try {
        const response = await pool.query(
          `Delete from bbnd_otps where dealership_id = $1`,
          [dealership_id]
        );

        try {
            const now = new Date();
      await pool.query(
        `UPDATE deleted_bbnd_inventory 
         SET "OTP Status" = true, "OTP Verification Date" = $2 
         WHERE deleted_bbnd_inventory_id = $1`,
        [id, now]
      );
          return res.json({ msg: "OTP Verified" });
        } catch (error) {
          console.log("error verifying otp", error);
          return res.json({ msg: "Error veryfying Otp" });
        }
      } catch (error) {
        console.log("error verifying otp", error);
        return res.json({ msg: "Error veryfying Otp" });
      }
    } else {
      return res.json({ msg: "otp incorrect" });
    }
  } catch (error) {
    console.log(error);
    return res.json({ msg: "Error Veryfying otp" });
  }
}

module.exports = { sendOTP, VerifyOTP };
