const pool = require('../connection');
const fs = require("fs");
const XLSX = require("xlsx");

async function UploadInventory (req,res) {
   try {
         if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { dealer_id } = req.body;
    if (!dealer_id) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }


     const filepath = req.file.path;
        const workbook = XLSX.readFile(filepath);
        const sheetname = workbook.SheetNames[0];
        const sheetDataRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
          defval: null,
        });
    
        if (sheetDataRaw.length === 0) {
          fs.unlinkSync(filepath);
          return res.json({ msg: "No Data found in Excel" });
        }
    
        const sheetData = sheetDataRaw.map((row) => {
          const newRow = {};
          for (let key in row) {
            if (row.hasOwnProperty(key)) {
              const trimmedKey = key.trim(); // <-- trim the key
              newRow[trimmedKey] = row[key];
            }
          }
          return newRow;
        });


       await Promise.all(
  sheetData.map((data) =>
    pool.query(
      `
      INSERT INTO dealer_inventory (
        "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id"
      )
      SELECT
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
      WHERE NOT EXISTS (
        SELECT 1 FROM dealer_inventory WHERE "Vin Number" = $15
      );
      `,
      [
        data["Order Dealer"],
        data["KIN Invoice No"],
        data["KIN Invoice Date"],
        data["Sign Off Date"],
        data["Sign Age"],
        data["Stock Age"],
        data["Model Code"],
        data["Model"],
        data["Variant Code"],
        data["Variant"],
        data["Color Type"],
        data["Exterior Color Name"],
        data["Interior Color Desc"],
        data["Full Spec Code"],
        data["Vin Number"],   // $15 ← THIS is VIN
        data["Stock Location"],
        data["Engine No"],
        data["Stock Status"],
        data["Cust Name"],
        data["Basic Price"],
        dealer_id
      ]
    )
  )
);

const sheetVins = sheetData
  .map(row => row["Vin Number"])
  .filter(Boolean);

if (sheetVins.length === 0) {
  throw new Error("Excel contains no VINs. Aborting delete sync.");
}
else{
    try {
  const result = await pool.query(
  `
  WITH moved_rows AS (
    DELETE FROM dealer_inventory
    WHERE dealer_id = $1
      AND "Vin Number" <> ALL($2)
    RETURNING 
    "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id"
  )
  INSERT INTO deleted_dealer_inventory(
  "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id"
        )
    SELECT "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id" from moved_rows
  `,
  [dealer_id, sheetVins]
);

console.log(result)
} catch (err) {
  console.error("DB ERROR:", err);
  throw err;
}

}
       




        return res.json({'msg':'Data uploaded'});
   } catch (error) {
    console.log(error)
    return res.json({error:`${error}`})
   }
}



async function UploadBBNDInventory (req,res){
     try {
         if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { dealer_id } = req.body;
    if (!dealer_id) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }


     const filepath = req.file.path;
        const workbook = XLSX.readFile(filepath);
        const sheetname = workbook.SheetNames[0];
        const sheetDataRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
          defval: null,
        });
    
        if (sheetDataRaw.length === 0) {
          fs.unlinkSync(filepath);
          return res.json({ msg: "No Data found in Excel" });
        }
    
        const sheetData = sheetDataRaw.map((row) => {
          const newRow = {};
          for (let key in row) {
            if (row.hasOwnProperty(key)) {
              const trimmedKey = key.trim(); // <-- trim the key
              newRow[trimmedKey] = row[key];
            }
          }
          return newRow;
        });


       await Promise.all(
  sheetData.map((data) =>
    pool.query(
      `
      INSERT INTO dealer_bbnd_inventory (
        "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
      )
      SELECT
        $1,$2,$3,$4,$5,$6,$7,$8,$9
      WHERE NOT EXISTS (
        SELECT 1 FROM dealer_bbnd_inventory WHERE "Vin Number" = $6
      );
      `,
      [
        data["Order Dealer"],
        data["Stock Age"],
        data["Model"],
        data["Variant"],
        data["Color Type"],
        data["Vin Number"],   
        data["Stock Status"],
        data["Cust Name"],
        dealer_id
      ]
    )
  )
);

const sheetVins = sheetData
  .map(row => row["Vin Number"])
  .filter(Boolean);

if (sheetVins.length === 0) {
  throw new Error("Excel contains no VINs. Aborting delete sync.");
}
else{
    try {
  const result = await pool.query(
  `
  WITH moved_rows AS (
    DELETE FROM dealer_bbnd_inventory
    WHERE dealer_id = $1
      AND "Vin Number" <> ALL($2)
    RETURNING 
   "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
  )
  INSERT INTO deleted_dealer_bbnd_inventory(
  "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
        )
    SELECT "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id" from moved_rows
  `,
  [dealer_id, sheetVins]
);

console.log(result)
} catch (err) {
  console.error("DB ERROR:", err);
  throw err;
}

}
       




        return res.json({'msg':'Data uploaded'});
   } catch (error) {
    console.log(error)
    return res.json({error:`${error}`})
   }
}


module.exports = {UploadInventory,UploadBBNDInventory}