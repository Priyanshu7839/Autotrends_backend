const pool = require('../connection')

async function loginUser (req,res) {
        const {number,uid} = req.body;
            try {
                const result = await pool.query(`SELECT * FROM userDetails WHERE phone_number=$1 AND user_uid=$2`,[number,uid]);
                if(result.rows.length === 1){
                  return res.status(200).json({"msg":"User exist","user":result.rows});
                }
                else{
                  return res.status(404).json({"msg":"User not found"});
                }
            } catch (error) {
                return res.status(501).json({"error":error.response})
            }

}


async function SignupUser (req,res) {
    const {name,number,uid} = req.body;
         try {
                const result = await pool.query(`SELECT * FROM userDetails WHERE phone_number=$1 AND user_uid=$2`,[number,uid]);
                if(result.rows.length === 1){
                  return res.status(200).json({"msg":"User Already exist","user":result.rows});
                }
                else{
                  const result = await pool.query(`INSERT INTO userDetails (user_name,user_uid,phone_number) VALUES ($1,$2,$3) RETURNING *`,[name,uid,number])
                  return res.status(200).json({"msg":"User Created","user":result.rows})
                }
            } catch (error) {
                return res.status(501).json({"error":error.response})
            }
}
module.exports = {loginUser,SignupUser}