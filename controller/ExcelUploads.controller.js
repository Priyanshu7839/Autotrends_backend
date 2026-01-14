const pool = require('../connection');
const fs = require("fs");
const XLSX = require("xlsx");

async function UploadInventory(req, res) {
  const client = await pool.connect();
  const filepath = req?.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { dealer_id } = req.body;
    if (!dealer_id) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }

    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];

    const sheetDataRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetDataRaw.length === 0) {
      return res.json({ msg: "No Data found in Excel" });
    }

    const sheetData = sheetDataRaw.map((row) => {
      const newRow = {};
      for (let key in row) {
        if (row.hasOwnProperty(key)) {
          newRow[key.trim()] = row[key];
        }
      }
      return newRow;
    });

    const sheetVins = sheetData
      .map((row) => row["Vin Number"])
      .filter(Boolean);

    if (sheetVins.length === 0) {
      return res.status(400).json({ message: "Excel contains no VINs. Aborting." });
    }

    await client.query("BEGIN");

    // ✅ Insert/Update inventory
    for (const data of sheetData) {
      await client.query(
        `
        INSERT INTO dealer_inventory (
          "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
          "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
          "Color Type","Exterior Color Name","Interior Color Desc",
          "Full Spec Code","Vin Number","Stock Location","Engine No",
          "Stock Status","Cust Name","Basic Price","dealer_id"
        )
        VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21
        )
        ON CONFLICT ("Vin Number")
        DO UPDATE SET
          "Order Dealer" = EXCLUDED."Order Dealer",
          "KIN Invoice No" = EXCLUDED."KIN Invoice No",
          "KIN Invoice Date" = EXCLUDED."KIN Invoice Date",
          "Sign Off Date" = EXCLUDED."Sign Off Date",
          "Sign Age" = EXCLUDED."Sign Age",
          "Stock Age" = EXCLUDED."Stock Age",
          "Model Code" = EXCLUDED."Model Code",
          "Model" = EXCLUDED."Model",
          "Variant Code" = EXCLUDED."Variant Code",
          "Variant" = EXCLUDED."Variant",
          "Color Type" = EXCLUDED."Color Type",
          "Exterior Color Name" = EXCLUDED."Exterior Color Name",
          "Interior Color Desc" = EXCLUDED."Interior Color Desc",
          "Full Spec Code" = EXCLUDED."Full Spec Code",
          "Stock Location" = EXCLUDED."Stock Location",
          "Engine No" = EXCLUDED."Engine No",
          "Stock Status" = EXCLUDED."Stock Status",
          "Cust Name" = EXCLUDED."Cust Name",
          "Basic Price" = EXCLUDED."Basic Price",
          dealer_id = EXCLUDED.dealer_id,
          updated_at = NOW();
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
          data["Vin Number"],
          data["Stock Location"],
          data["Engine No"],
          data["Stock Status"],
          data["Cust Name"],
          data["Basic Price"],
          dealer_id,
        ]
      );
    }

    // ✅ Move missing VINs to deleted table + delete from inventory
    await client.query(
      `
      WITH moved_rows AS (
        DELETE FROM dealer_inventory
        WHERE dealer_id = $1
          AND NOT ("Vin Number" = ANY($2))
        RETURNING *
      )
      INSERT INTO deleted_dealer_inventory (
        "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id"
      )
      SELECT
        "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
        "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
        "Color Type","Exterior Color Name","Interior Color Desc",
        "Full Spec Code","Vin Number","Stock Location","Engine No",
        "Stock Status","Cust Name","Basic Price","dealer_id"
      FROM moved_rows
      ON CONFLICT ("Vin Number") DO NOTHING;
      `,
      [dealer_id, sheetVins]
    );

    await client.query("COMMIT");

    return res.json({ msg: "Data uploaded" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ error: String(error) });
  } finally {
    client.release();
    if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }
}




async function UploadBBNDInventory(req, res) {
  const client = await pool.connect();
  const filepath = req?.file?.path;

  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { dealer_id } = req.body;
    if (!dealer_id) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }

    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];

    const sheetDataRaw = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetDataRaw.length === 0) {
      return res.json({ msg: "No Data found in Excel" });
    }

    const sheetData = sheetDataRaw.map((row) => {
      const newRow = {};
      for (let key in row) {
        if (row.hasOwnProperty(key)) {
          newRow[key.trim()] = row[key];
        }
      }
      return newRow;
    });

    const sheetVins = sheetData.map((row) => row["Vin Number"]).filter(Boolean);

    if (sheetVins.length === 0) {
      return res.status(400).json({ message: "Excel contains no VINs. Aborting delete sync." });
    }

    await client.query("BEGIN");

    // ✅ Upsert / touch updated_at
    for (const data of sheetData) {
      await client.query(
        `
        INSERT INTO dealer_bbnd_inventory (
          "Order Dealer","Stock Age","Model","Variant",
          "Color Type","Vin Number",
          "Stock Status","Cust Name","dealer_id"
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT ("Vin Number")
        DO UPDATE SET
  "Order Dealer" = EXCLUDED."Order Dealer",
  "Stock Age"    = EXCLUDED."Stock Age",
  "Model"        = EXCLUDED."Model",
  "Variant"      = EXCLUDED."Variant",
  "Color Type"   = EXCLUDED."Color Type",
  "Stock Status" = EXCLUDED."Stock Status",
  "Cust Name"    = EXCLUDED."Cust Name",
  "dealer_id"    = EXCLUDED."dealer_id",
  updated_at     = NOW();
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
          dealer_id,
        ]
      );
    }

    // ✅ Delete VINs missing from upload + move to deleted table
    await client.query(
      `
      WITH moved_rows AS (
        DELETE FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND NOT ("Vin Number" = ANY($2))
        RETURNING
          "Order Dealer","Stock Age","Model","Variant",
          "Color Type","Vin Number",
          "Stock Status","Cust Name","dealer_id"
      )
      INSERT INTO deleted_dealer_bbnd_inventory (
        "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
      )
      SELECT
        "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
      FROM moved_rows
      ON CONFLICT ("Vin Number") DO NOTHING;
      `,
      [dealer_id, sheetVins]
    );

    await client.query("COMMIT");

    return res.json({ msg: "Data uploaded" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.log(error);
    return res.status(500).json({ error: String(error) });
  } finally {
    client.release();
    if (filepath && fs.existsSync(filepath)) fs.unlinkSync(filepath);
  }
}


module.exports = {UploadInventory,UploadBBNDInventory}