const pool = require('../connection');
const format = require("pg-format");
const XLSX = require("xlsx");

const fs = require("fs");
const ExcelJS = require('exceljs')
const { Readable } = require("stream");

// function normalizeCellValue(cell) {
//   if (!cell || cell.value == null) return null;

//   // Formula cell
//   if (typeof cell.value === "object") {
//     // ExcelJS does NOT calculate formulas
//     if (cell.value.formula && cell.value.result == null) {
//       throw new Error(
//         `Uncalculated formula found: ${cell.value.formula}`
//       );
//     }
//     return cell.value.result ?? null;
//   }

//   // Normal value (number, string, date, etc.)
//   return cell.value;
// }

// async function UploadInventory(req, res) {
//   if (!req.file || !req.file.buffer){
//     console.log('exit')
//     return res.status(400).json({ message: "No file uploaded" });}
//   const client = await pool.connect();
//   const buffer = req?.file?.buffer;
//   console.log('hit')
//   try {
    
   
    
    
//     const { dealer_id } = req.body;
//     if (!dealer_id) return res.status(400).json({ message: "Dealership ID is required" });
//   const workbook = new ExcelJS.Workbook();
// await workbook.xlsx.load(buffer);

// const worksheet = workbook.getWorksheet(1); // first sheet

// if (!worksheet || worksheet.rowCount <= 1) {
//   return res.json({ msg: "No Data found in Excel" });
// }

// const headers = {};
// const sheetData = [];
// const sheetVins = [];
//   console.log('hit1')


// // Read header row once
// worksheet.getRow(1).eachCell((cell, colNumber) => {
//   if (cell.value) {
//     headers[colNumber] = String(cell.value).trim();
//   }
// });

// // Read rows (ONE pass)
// worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//   if (rowNumber === 1) return; // skip header

//   const obj = {};

//   row.eachCell((cell, colNumber) => {
//     const key = headers[colNumber];
//     if (!key) return;
//     obj[key] = normalizeCellValue(cell);
//   });

//   // Collect VIN early (avoid extra loop)
//   if (obj["Vin Number"]) {
//     sheetVins.push(obj["Vin Number"]);
//   }

//   sheetData.push(obj);
// });

// // Final validations
// if (sheetData.length === 0) {
//   return res.json({ msg: "No Data found in Excel" });
// }

// if (sheetVins.length === 0) {
//   return res.status(400).json({
//     message: "Excel contains no VINs. Aborting.",
//   });
// }



//     await client.query("BEGIN");

//     // ✅ 1) Create TEMP staging table (drops automatically)
//     await client.query(`
//       CREATE TEMP TABLE temp_inventory_upload (
//         "Order Dealer" TEXT,
//         "KIN Invoice No" TEXT,
//         "KIN Invoice Date" TEXT,
//         "Sign Off Date" TEXT,
//         "Sign Age" INT,
//         "Stock Age" INT,
//         "Model Code" TEXT,
//         "Model" TEXT,
//         "Variant Code" TEXT,
//         "Variant" TEXT,
//         "Color Type" TEXT,
//         "Exterior Color Name" TEXT,
//         "Interior Color Desc" TEXT,
//         "Full Spec Code" TEXT,
//         "Vin Number" TEXT,
//         "Stock Location" TEXT,
//         "Engine No" TEXT,
//         "Stock Status" TEXT,
//         "Cust Name" TEXT,
//         "Basic Price" TEXT,
//         dealer_id INT
//       ) ON COMMIT DROP;
//     `);



//     // ✅ 2) Bulk insert into temp table (ONE QUERY)
//     const values = sheetData.map((data) => [
//       data["Order Dealer"],
//       data["KIN Invoice No"],
//       data["KIN Invoice Date"],
//       data["Sign Off Date"],
//       data["Sign Age"],
//       data["Stock Age"],
//       data["Model Code"],
//       data["Model"],
//       data["Variant Code"],
//       data["Variant"],
//       data["Color Type"],
//       data["Exterior Color Name"],
//       data["Interior Color Desc"],
//       data["Full Spec Code"],
//       data["Vin Number"],
//       data["Stock Location"],
//       data["Engine No"],
//       data["Stock Status"],
//       data["Cust Name"],
//       data["Basic Price"],
//       Number(dealer_id),
//     ]);


//     const bulkInsertQuery = format(
//       `
//       INSERT INTO temp_inventory_upload (
//         "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
//         "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
//         "Color Type","Exterior Color Name","Interior Color Desc",
//         "Full Spec Code","Vin Number","Stock Location","Engine No",
//         "Stock Status","Cust Name","Basic Price","dealer_id"
//       )
//       VALUES %L
//       `,
//       values
//     );

//     await client.query(bulkInsertQuery);



//     // ✅ 3) One UPSERT into real table
//     await client.query(`
//       INSERT INTO dealer_inventory (
//         "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
//         "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
//         "Color Type","Exterior Color Name","Interior Color Desc",
//         "Full Spec Code","Vin Number","Stock Location","Engine No",
//         "Stock Status","Cust Name","Basic Price","dealer_id"
//       )
//       SELECT
//         "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
//         "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
//         "Color Type","Exterior Color Name","Interior Color Desc",
//         "Full Spec Code","Vin Number","Stock Location","Engine No",
//         "Stock Status","Cust Name","Basic Price","dealer_id"
//       FROM temp_inventory_upload
//       ON CONFLICT ("Vin Number")
//       DO UPDATE SET
//         "Order Dealer" = EXCLUDED."Order Dealer",
//         "KIN Invoice No" = EXCLUDED."KIN Invoice No",
//         "KIN Invoice Date" = EXCLUDED."KIN Invoice Date",
//         "Sign Off Date" = EXCLUDED."Sign Off Date",
//         "Sign Age" = EXCLUDED."Sign Age",
//         "Stock Age" = EXCLUDED."Stock Age",
//         "Model Code" = EXCLUDED."Model Code",
//         "Model" = EXCLUDED."Model",
//         "Variant Code" = EXCLUDED."Variant Code",
//         "Variant" = EXCLUDED."Variant",
//         "Color Type" = EXCLUDED."Color Type",
//         "Exterior Color Name" = EXCLUDED."Exterior Color Name",
//         "Interior Color Desc" = EXCLUDED."Interior Color Desc",
//         "Full Spec Code" = EXCLUDED."Full Spec Code",
//         "Stock Location" = EXCLUDED."Stock Location",
//         "Engine No" = EXCLUDED."Engine No",
//         "Stock Status" = EXCLUDED."Stock Status",
//         "Cust Name" = EXCLUDED."Cust Name",
//         "Basic Price" = EXCLUDED."Basic Price",
//         dealer_id = EXCLUDED.dealer_id,
//         updated_at = NOW();
//     `);



//     // ✅ 4) Delete + move missing VINs in ONE go (fast)
//     await client.query(
//       `
//       WITH moved_rows AS (
//         DELETE FROM dealer_inventory di
//         WHERE di.dealer_id = $1
//           AND NOT EXISTS (
//             SELECT 1
//             FROM temp_inventory_upload t
//             WHERE t."Vin Number" = di."Vin Number"
//           )
//         RETURNING *
//       )
//       INSERT INTO deleted_dealer_inventory (
//         "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
//         "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
//         "Color Type","Exterior Color Name","Interior Color Desc",
//         "Full Spec Code","Vin Number","Stock Location","Engine No",
//         "Stock Status","Cust Name","Basic Price","dealer_id"
//       )
//       SELECT
//         "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
//         "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
//         "Color Type","Exterior Color Name","Interior Color Desc",
//         "Full Spec Code","Vin Number","Stock Location","Engine No",
//         "Stock Status","Cust Name","Basic Price","dealer_id"
//       FROM moved_rows
//       ON CONFLICT ("Vin Number") DO NOTHING;
//       `,
//       [dealer_id]
//     );



//     await client.query("COMMIT");
//     console.log('ran')

//     return res.json({ msg: "Data uploaded", totalRows: sheetData.length });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.log(error);
//     return res.status(500).json({ error: String(error) });
//   } finally {
//     client.release();
    
//   }
// }

const BATCH_SIZE = 500;

function normalizeCellValue(cell) {
  if (!cell || cell.value == null) return null;

  if (typeof cell.value === "object") {
    if (cell.value.formula && cell.value.result == null) {
      throw new Error(`Uncalculated formula: ${cell.value.formula}`);
    }
    return cell.value.result ?? null;
  }

  return cell.value;
}

async function UploadInventory(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const { dealer_id } = req.body;
  if (!dealer_id) {
    return res.status(400).json({ msg: "Dealership ID is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Create TEMP table (once)
    await client.query(`
      CREATE TEMP TABLE temp_inventory_upload (
        "Order Dealer" TEXT,
        "KIN Invoice No" TEXT,
        "KIN Invoice Date" TEXT,
        "Sign Off Date" TEXT,
        "Sign Age" INT,
        "Stock Age" INT,
        "Model Code" TEXT,
        "Model" TEXT,
        "Variant Code" TEXT,
        "Variant" TEXT,
        "Color Type" TEXT,
        "Exterior Color Name" TEXT,
        "Interior Color Desc" TEXT,
        "Full Spec Code" TEXT,
        "Vin Number" TEXT,
        "Stock Location" TEXT,
        "Engine No" TEXT,
        "Stock Status" TEXT,
        "Cust Name" TEXT,
        "Basic Price" TEXT,
        dealer_id INT
      ) ON COMMIT DROP;
    `);

    // 2️⃣ Stream Excel (constant memory)
    const stream = Readable.from(req.file.buffer);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(
      stream, {
  worksheets: "emit",
}
    );

    let headers = {};
    let batch = [];
    let totalRows = 0;

    for await (const worksheet of workbookReader) {
      for await (const row of worksheet) {
        // Header row
        if (row.number === 1) {
          row.eachCell((cell, colNumber) => {
            if (cell.value) {
              headers[colNumber] = String(cell.value).trim();
            }
          });
          continue;
        }

        const obj = {};
        row.eachCell((cell, colNumber) => {
          const key = headers[colNumber];
          if (!key) return;
          obj[key] = normalizeCellValue(cell);
        });

        if (!obj["Vin Number"]) continue;

        batch.push([
          obj["Order Dealer"],
          obj["KIN Invoice No"],
          obj["KIN Invoice Date"],
          obj["Sign Off Date"],
          obj["Sign Age"],
          obj["Stock Age"],
          obj["Model Code"],
          obj["Model"],
          obj["Variant Code"],
          obj["Variant"],
          obj["Color Type"],
          obj["Exterior Color Name"],
          obj["Interior Color Desc"],
          obj["Full Spec Code"],
          obj["Vin Number"],
          obj["Stock Location"],
          obj["Engine No"],
          obj["Stock Status"],
          obj["Cust Name"],
          obj["Basic Price"],
          Number(dealer_id),
        ]);

        totalRows++;

        // 🔥 Flush batch
        if (batch.length === BATCH_SIZE) {
          await insertBatch(client, batch);
          batch.length = 0;
        }
      }
    }

    // Flush remainder
    if (batch.length > 0) {
      await insertBatch(client, batch);
    }

    if (totalRows === 0) {
      throw new Error("Excel contains no valid rows");
    }

    // 3️⃣ One UPSERT
    await client.query(`
      INSERT INTO dealer_inventory (
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
      FROM temp_inventory_upload
      ON CONFLICT ("Vin Number") DO UPDATE SET
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
    `);

    // 4️⃣ Delete + archive missing VINs
    await client.query(
      `
      WITH moved_rows AS (
        DELETE FROM dealer_inventory di
        WHERE di.dealer_id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM temp_inventory_upload t
            WHERE t."Vin Number" = di."Vin Number"
          )
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
      [dealer_id]
    );

    await client.query("COMMIT");

    return res.json({
      msg: "Data uploaded",
      totalRows,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

// helper
async function insertBatch(client, batch) {
  const query = format(
    `
    INSERT INTO temp_inventory_upload (
      "Order Dealer","KIN Invoice No","KIN Invoice Date","Sign Off Date",
      "Sign Age","Stock Age","Model Code","Model","Variant Code","Variant",
      "Color Type","Exterior Color Name","Interior Color Desc",
      "Full Spec Code","Vin Number","Stock Location","Engine No",
      "Stock Status","Cust Name","Basic Price","dealer_id"
    )
    VALUES %L
    `,
    batch
  );

  await client.query(query);
}


// async function UploadBBNDInventory(req, res) {
  
//   if (!req.file || !req.file.buffer) {
//     return res.status(400).json({ msg: "No file uploaded" });
//   }
//   const client = await pool.connect();
//   const buffer = req?.file?.buffer;

//   try {
   

//     const { dealer_id } = req.body;
//     if (!dealer_id) {
//       return res.status(400).json({ msg: "Dealership ID is required" });
//     }

//     const workbook = new ExcelJS.Workbook();
// await workbook.xlsx.load(buffer);

// const worksheet = workbook.getWorksheet(1); // first sheet

// if (!worksheet || worksheet.rowCount <= 1) {
//   return res.json({ msg: "No Data found in Excel" });
// }

// const headers = {};
// const sheetData = [];
// const sheetVins = [];

// // Read header row once
// worksheet.getRow(1).eachCell((cell, colNumber) => {
//   if (cell.value) {
//     headers[colNumber] = String(cell.value).trim();
//   }
// });

// // Read rows (ONE pass)
// worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
//   if (rowNumber === 1) return; // skip header

//   const obj = {};

//   row.eachCell((cell, colNumber) => {
//     const key = headers[colNumber];
//     if (!key) return;

//     obj[key] = normalizeCellValue(cell);
//   });

//   // Collect VIN early (avoid extra loop)
//   if (obj["Vin Number"]) {
//     sheetVins.push(obj["Vin Number"]);
//   }

//   sheetData.push(obj);
// });

// // Final validations
// if (sheetData.length === 0) {
//   return res.json({ msg: "No Data found in Excel" });
// }

// if (sheetVins.length === 0) {
//   return res.status(400).json({
//     msg: "Excel contains no VINs. Aborting.",
//   });
// }
//     await client.query("BEGIN");

//     // ✅ 1) Temp staging table (auto drops)
//     await client.query(`
//       CREATE TEMP TABLE temp_bbnd_upload (
//         "Order Dealer" TEXT,
//         "Stock Age" INT,
//         "Model" TEXT,
//         "Variant" TEXT,
//         "Color Type" TEXT,
//         "Vin Number" TEXT,
//         "Stock Status" TEXT,
//         "Cust Name" TEXT,
//         dealer_id INT
//       ) ON COMMIT DROP;
//     `);

//     // ✅ 2) Bulk insert into staging table (ONE QUERY)
//     const values = sheetData.map((data) => [
//       data["Order Dealer"],
//       data["Stock Age"],
//       data["Model"],
//       data["Variant"],
//       data["Color Type"],
//       data["Vin Number"],
//       data["Stock Status"],
//       data["Cust Name"],
//       Number(dealer_id),
//     ]);

  
//     const bulkInsertQuery = format(
//       `
//       INSERT INTO temp_bbnd_upload (
//         "Order Dealer","Stock Age","Model","Variant",
//         "Color Type","Vin Number","Stock Status","Cust Name","dealer_id"
//       )
//       VALUES %L
//       `,
//       values
//     );

//     await client.query(bulkInsertQuery);

//     // ✅ 3) One UPSERT into real table
//     await client.query(`
//       INSERT INTO dealer_bbnd_inventory (
//         "Order Dealer","Stock Age","Model","Variant",
//         "Color Type","Vin Number",
//         "Stock Status","Cust Name","dealer_id"
//       )
//       SELECT
//         "Order Dealer","Stock Age","Model","Variant",
//         "Color Type","Vin Number",
//         "Stock Status","Cust Name","dealer_id"
//       FROM temp_bbnd_upload
//       ON CONFLICT ("Vin Number")
//       DO UPDATE SET
//         "Order Dealer" = EXCLUDED."Order Dealer",
//         "Stock Age"    = EXCLUDED."Stock Age",
//         "Model"        = EXCLUDED."Model",
//         "Variant"      = EXCLUDED."Variant",
//         "Color Type"   = EXCLUDED."Color Type",
//         "Stock Status" = EXCLUDED."Stock Status",
//         "Cust Name"    = EXCLUDED."Cust Name",
//         "dealer_id"    = EXCLUDED."dealer_id",
//         updated_at     = NOW();
//     `);

//     // ✅ 4) Delete VINs missing from upload + move to deleted table
//     await client.query(
//       `
//       WITH moved_rows AS (
//         DELETE FROM dealer_bbnd_inventory di
//         WHERE di.dealer_id = $1
//           AND NOT EXISTS (
//             SELECT 1
//             FROM temp_bbnd_upload t
//             WHERE t."Vin Number" = di."Vin Number"
//           )
//         RETURNING
//           "Order Dealer","Stock Age","Model","Variant",
//           "Color Type","Vin Number",
//           "Stock Status","Cust Name","dealer_id"
//       )
//       INSERT INTO deleted_dealer_bbnd_inventory (
//         "Order Dealer","Stock Age","Model","Variant",
//         "Color Type","Vin Number",
//         "Stock Status","Cust Name","dealer_id"
//       )
//       SELECT
//         "Order Dealer","Stock Age","Model","Variant",
//         "Color Type","Vin Number",
//         "Stock Status","Cust Name","dealer_id"
//       FROM moved_rows
//       ON CONFLICT ("Vin Number") DO NOTHING;
//       `,
//       [dealer_id]
//     );

//     await client.query("COMMIT");

//     console.log('ran')

//     return res.json({
//       msg: "Data uploaded",
//       totalRows: sheetData.length,
//     });
//   } catch (error) {
//     await client.query("ROLLBACK");
//     console.log(error);
//     return res.status(500).json({ error: String(error) });
//   } finally {
//     client.release();
   
//   }
// }


async function UploadBBNDInventory(req, res) {
  if (!req.file || !req.file.buffer) {
    return res.status(400).json({ msg: "No file uploaded" });
  }

  const { dealer_id } = req.body;
  if (!dealer_id) {
    return res.status(400).json({ msg: "Dealership ID is required" });
  }

  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    // 1️⃣ Temp table
    await client.query(`
      CREATE TEMP TABLE temp_bbnd_upload (
        "Order Dealer" TEXT,
        "Stock Age" INT,
        "Model" TEXT,
        "Variant" TEXT,
        "Color Type" TEXT,
        "Vin Number" TEXT,
        "Stock Status" TEXT,
        "Cust Name" TEXT,
        dealer_id INT
      ) ON COMMIT DROP;
    `);

    // 2️⃣ Stream Excel from buffer
    const stream = Readable.from(req.file.buffer);
    const workbookReader = new ExcelJS.stream.xlsx.WorkbookReader(stream, {
      worksheets: "emit",
      sharedStrings: "cache",
      styles: "ignore",
      hyperlinks: "ignore",
    });

    let headers = {};
    let batch = [];
    let totalRows = 0;

    for await (const worksheet of workbookReader) {
      for await (const row of worksheet) {
        // Header row
        if (row.number === 1) {
          row.eachCell((cell, colNumber) => {
            if (cell.value) {
              headers[colNumber] = String(cell.value).trim();
            }
          });
          continue;
        }

        const obj = {};
        row.eachCell((cell, colNumber) => {
          const key = headers[colNumber];
          if (!key) return;
          obj[key] = normalizeCellValue(cell);
        });

        if (!obj["Vin Number"]) continue;

        batch.push([
          obj["Order Dealer"],
          obj["Stock Age"],
          obj["Model"],
          obj["Variant"],
          obj["Color Type"],
          obj["Vin Number"],
          obj["Stock Status"],
          obj["Cust Name"],
          Number(dealer_id),
        ]);

        totalRows++;

        // 🔥 flush batch
        if (batch.length === BATCH_SIZE) {
          await insertBBNDBatch(client, batch);
          batch.length = 0;
        }
      }
    }

    // Flush remainder
    if (batch.length > 0) {
      await insertBBNDBatch(client, batch);
    }

    if (totalRows === 0) {
      throw new Error("Excel contains no valid rows");
    }

    // 3️⃣ UPSERT into main table
    await client.query(`
      INSERT INTO dealer_bbnd_inventory (
        "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
      )
      SELECT
        "Order Dealer","Stock Age","Model","Variant",
        "Color Type","Vin Number",
        "Stock Status","Cust Name","dealer_id"
      FROM temp_bbnd_upload
      ON CONFLICT ("Vin Number") DO UPDATE SET
        "Order Dealer" = EXCLUDED."Order Dealer",
        "Stock Age"    = EXCLUDED."Stock Age",
        "Model"        = EXCLUDED."Model",
        "Variant"      = EXCLUDED."Variant",
        "Color Type"   = EXCLUDED."Color Type",
        "Stock Status" = EXCLUDED."Stock Status",
        "Cust Name"    = EXCLUDED."Cust Name",
        dealer_id      = EXCLUDED.dealer_id,
        updated_at     = NOW();
    `);

    // 4️⃣ Delete missing VINs + archive
    await client.query(
      `
      WITH moved_rows AS (
        DELETE FROM dealer_bbnd_inventory di
        WHERE di.dealer_id = $1
          AND NOT EXISTS (
            SELECT 1
            FROM temp_bbnd_upload t
            WHERE t."Vin Number" = di."Vin Number"
          )
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
      [dealer_id]
    );

    await client.query("COMMIT");

    return res.json({
      msg: "Data uploaded",
      totalRows,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    return res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}

async function insertBBNDBatch(client, batch) {
  const query = format(
    `
    INSERT INTO temp_bbnd_upload (
      "Order Dealer","Stock Age","Model","Variant",
      "Color Type","Vin Number",
      "Stock Status","Cust Name","dealer_id"
    )
    VALUES %L
    `,
    batch
  );

  await client.query(query);
}

module.exports = {UploadInventory,UploadBBNDInventory}