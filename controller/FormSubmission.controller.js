const pool = require("../connection");
const multer = require("multer");
const fs = require("fs");
const XLSX = require("xlsx");

async function CarQuotationForm(req, res) {
  const {
    uid,
    lat,
    lon,
    city,
    price,
    dealership,
    color,
    car_id,
    variant_id,
    hexCode,
  } = req.body;

  if (
    !uid ||
    !lat ||
    !lon ||
    !city ||
    !price ||
    !dealership ||
    !color ||
    !car_id ||
    !variant_id
  ) {
    return res.json({ msg: "Fill all the Data" });
  }

  try {
    const response = await pool.query(
      `INSERT INTO car_quotations (user_uid,lat,lon,city,price,offering_dealership,color,car_id,variant_id,color_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
      [
        uid,
        lat,
        lon,
        city,
        price,
        dealership,
        color,
        car_id,
        variant_id,
        hexCode,
      ]
    );

    return res.json({ msg: "Quotation Submitted" });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function SubmitPan(req, res) {
  const { pan, uid } = req.body;
  if (!pan || !uid) {
    return res.json({ msg: "PLease Submit Pan Number or UID" });
  }

  try {
    const response = await pool.query(
      `UPDATE userDetails SET pancard=$1 WHERE user_uid=$2 `,
      [pan, uid]
    );

    return res.json({ msg: "pan Submitted" });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function UpdateInventory(req, res) {
  const {
    dealer_id,
    car_id,
    variant_id,
    year,
    color,
    color_code,
    stock,
    accessories,
    tcs,
    insurance,
    agent,
    fasttag,
    warranty,
    miscellaneous,
    rto,
    delivery,
    qty,
    bid,
  } = req.body;
  try {
    const response = await pool.query(
      `INSERT INTO inventory (dealer_id,car_id,variant_id,model_year,model_color,color_code,stock_number,qty,accessories_charges,tcs_charges,insurance_charges,insurance_agent,fasttag_charges,extended_warranty_charges,rto_price,miscellaneous_charges,expected_delivery,autotrends_bid_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,
      [
        dealer_id,
        car_id,
        variant_id,
        year,
        color,
        color_code,
        stock,
        qty,
        accessories,
        tcs,
        insurance,
        agent,
        fasttag,
        warranty,
        rto,
        miscellaneous,
        delivery,
        bid,
      ]
    );

    return res.json({ msg: "Inventory Updated" });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function SpecificQuotation(req, res) {
  const { user_uid, inventory_id, lat, lon, city } = req.body;

  try {
    const response = await pool.query(
      `INSERT INTO dealer_specific_quotations (user_uid,inventory_id,lat,lon,city) VALUES ($1,$2,$3,$4,$5)`,
      [user_uid, inventory_id, lat, lon, city]
    );

    return res.json({ msg: "Quotation Updated" });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function UploadXL(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { orderDealer } = req.body;
    if (!orderDealer) {
      return res.status(400).json({ message: "Order Dealer is required" });
    }

    const { dealershipId } = req.body;
    if (!dealershipId) {
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

    // * ////////////////////////////////Deleted Inventory table Upload/////////////////////////////////////////////////////////////////

    const newSheetInsertValues = sheetData.map((row) => row);
    try {
      const deleteduploadResult = await pool.query(
        `Select upload_id,uploaded_at from uploads where "dealership_id" = $1 AND "dealer_code" = $2 ORDER BY  uploaded_at DESC LIMIT 1 `,
        [dealershipId, orderDealer]
      );

      const del_upload_id = deleteduploadResult?.rows[0]?.upload_id;

      const response = await pool.query(
        `Select * from main_inventory WHERE "upload_id" = $1 AND "dealer_code" = $2`,
        [del_upload_id, orderDealer]
      );

      const oldSheet = response?.rows.map((row) => row.stock_data);

      const oldMap = new Map(oldSheet.map((obj) => [obj["Vin Number"], obj]));

      const newMap = new Map(
        newSheetInsertValues.map((obj) => [obj["Vin Number"], obj])
      );

      const added = newSheetInsertValues.filter(
        (obj) => !oldMap.has(obj["Vin Number"])
      );

      // Deleted → In oldSheet but not in newSheet
      const deleted = oldSheet.filter((obj) => !newMap.has(obj["Vin Number"]));

      const insertValuesDeleted = [];
      const placeholdersDeleted = [];

      deleted.forEach((row, i) => {
        insertValuesDeleted.push(
          del_upload_id,
          dealershipId,
          orderDealer,
          JSON.stringify(row)
        );
        placeholdersDeleted.push(
          `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}::jsonb)`
        );
      });
      const insertQueryDeleted = `
      INSERT INTO deleted_main_inventory (upload_id, dealer_id, dealer_code, stock_data)
      VALUES ${placeholdersDeleted.join(", ")}
    `;

      if (deleted && deleted.length > 0) {
        await pool.query(insertQueryDeleted, insertValuesDeleted);
      }
    } catch (error) {
      console.log(error);
      return res.json({ error: error.response });
    }
    // * //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    // 1. Insert into uploads table
    const uploadResult = await pool.query(
      `INSERT INTO uploads (dealership_id,dealer_code) VALUES ($1,$2) RETURNING upload_id, uploaded_at`,
      [dealershipId, orderDealer]
    );
    const { upload_id, uploaded_at } = uploadResult.rows[0];

    // 2. Prepare inventory inserts (each row → JSONB)
    const insertValues = [];
    const placeholders = [];

    sheetData.forEach((row, i) => {
      insertValues.push(
        upload_id,
        dealershipId,
        orderDealer,
        JSON.stringify(row)
      );
      placeholders.push(
        `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}::jsonb)`
      );
    });

    const insertQuery = `
      INSERT INTO main_inventory (upload_id, dealer_id, dealer_code, stock_data)
      VALUES ${placeholders.join(", ")}
    `;

    await pool.query(insertQuery, insertValues);

    // Delete temp file
    fs.unlinkSync(filepath);

    res.json({
      message: "Data uploaded successfully",
      upload_id,
      uploaded_at,
      dealership_id: dealershipId,
      order_dealer: orderDealer,
      rows_inserted: sheetData.length,
    });
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
}

async function BBNDUploadXLCompare(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { orderDealer } = req.body;
    if (!orderDealer) {
      return res.status(400).json({ message: "Order Dealer is required" });
    }

    const filepath = req.file.path;
    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetData.length === 0) {
      fs.unlinkSync(filepath);
      return res.json({ msg: "No Data found in Excel" });
    }

    const newSheetInsertValues = sheetData.map((row) => row);

    const { dealershipId } = req.body;
    if (!dealershipId) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }

    try {
      const bbnduploadResult = await pool.query(
        `Select bbnd_upload_id,uploaded_at from bbnd_uploads where "dealership_id" = $1 AND "dealer_code" = $2 ORDER BY  uploaded_at DESC LIMIT 1 `,
        [dealershipId, orderDealer]
      );

      const bbnd_upload_id = bbnduploadResult?.rows[0]?.bbnd_upload_id;

      try {
        const response = await pool.query(
          `Select * from bbnd_inventory WHERE "bbnd_upload_id" = $1 AND "dealer_code" = $2`,
          [bbnd_upload_id, orderDealer]
        );

        const oldSheet = response?.rows.map((row) => row.stock_data);

        const oldMap = new Map(oldSheet.map((obj) => [obj["Vin Number"], obj]));
        const newMap = new Map(
          newSheetInsertValues.map((obj) => [obj["Vin Number"], obj])
        );
        const added = newSheetInsertValues.filter(
          (obj) => !oldMap.has(obj["Vin Number"])
        );

        // Deleted → In oldSheet but not in newSheet
        const deleted = oldSheet.filter(
          (obj) => !newMap.has(obj["Vin Number"])
        );

        return res.json({ msg: "Compared", added: added, deleted: deleted });
      } catch (error) {
        console.log(error);
        return res.json({ error: error.response });
      }
    } catch (error) {
      console.log(error);
      return res.json({ error: error.response });
    }
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
}

async function UploadBBNDXL(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { orderDealer } = req.body;
    if (!orderDealer) {
      return res.status(400).json({ message: "Order Dealer is required" });
    }

    const filepath = req.file.path;
    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetData.length === 0) {
      fs.unlinkSync(filepath);
      return res.json({ msg: "No Data found in Excel" });
    }

    // Assume dealership_id is also passed in request body
    const { dealershipId } = req.body;

    if (!dealershipId) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }

    // 1. Insert into uploads table
    const bbnduploadResult = await pool.query(
      `INSERT INTO bbnd_uploads (dealership_id,dealer_code) VALUES ($1,$2) RETURNING bbnd_upload_id, uploaded_at`,
      [dealershipId, orderDealer]
    );
    const { bbnd_upload_id, uploaded_at } = bbnduploadResult.rows[0];

    // 2. Prepare inventory inserts (each row → JSONB)
    const insertValues = [];
    const placeholders = [];

    sheetData.forEach((row, i) => {
      insertValues.push(
        bbnd_upload_id,
        dealershipId,
        orderDealer,
        JSON.stringify(row)
      );
      placeholders.push(
        `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}::jsonb)`
      );
    });
    const insertQuery = `
      INSERT INTO bbnd_inventory (bbnd_upload_id, dealer_id, dealer_code, stock_data)
      VALUES ${placeholders.join(", ")}
    `;

    const deletedData = JSON.parse(req.body.deletedData);

    const insertValuesDeleted = [];
    const placeholdersDeleted = [];

    deletedData.forEach((row, i) => {
      insertValuesDeleted.push(
        bbnd_upload_id,
        dealershipId,
        orderDealer,
        JSON.stringify(row)
      );
      placeholdersDeleted.push(
        `($${i * 4 + 1}, $${i * 4 + 2}, $${i * 4 + 3}, $${i * 4 + 4}::jsonb)`
      );
    });
    const insertQueryDeleted = `
      INSERT INTO deleted_bbnd_inventory (bbnd_upload_id, dealer_id, dealer_code, stock_data)
      VALUES ${placeholdersDeleted.join(", ")}
    `;

    await pool.query(insertQuery, insertValues);

    if (deletedData && deletedData.length > 0) {
      await pool.query(insertQueryDeleted, insertValuesDeleted);
    }

    // Delete temp file
    fs.unlinkSync(filepath);

    return res.json({
      message: "Data uploaded successfully",
      bbnd_upload_id,
      uploaded_at,
      dealership_id: dealershipId,
      order_dealer: orderDealer,
      rows_inserted: sheetData.length,
    });
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
}

async function UploadSalesXL(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { orderDealer, dealershipId } = req.body;

    if (!orderDealer) {
      return res.status(400).json({ message: "Order Dealer is required" });
    }
    if (!dealershipId) {
      return res.status(400).json({ message: "Dealership ID is required" });
    }

    const filepath = req.file.path;
    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetData.length === 0) {
      fs.unlinkSync(filepath);
      return res.json({ msg: "No Data found in Excel" });
    }

    // Prepare inserts
    const insertValues = [];
    const placeholders = [];

    sheetData.forEach((row, i) => {
      const idx = i * 3; // 3 params per row
      insertValues.push(dealershipId, orderDealer, JSON.stringify(row));
      placeholders.push(`($${idx + 1}, $${idx + 2}, $${idx + 3}::jsonb)`);
    });

    const insertQuery = `
      INSERT INTO sales_data (dealership_id, dealer_code, stock_data)
      VALUES ${placeholders.join(", ")}
       ON CONFLICT ((stock_data->>'Vin Number')) DO NOTHING
    `;

    await pool.query(insertQuery, insertValues);

    // Delete temp file
    fs.unlinkSync(filepath);

    return res.json({
      message: "Data uploaded successfully",
      dealership_id: dealershipId,
      order_dealer: orderDealer,
    });
  } catch (error) {
    console.error("Error uploading Excel:", error);
    res.status(500).json({ message: "Error uploading file" });
  }
}

async function AverageSalesUpload(req, res) {
  const { averageSales, dealer_id } = req.body;

  try {
    const response = await pool.query(
      `UPDATE onboarded_dealers 
   SET "Average Sales" = $1 
   WHERE pk_id = $2 
   RETURNING *`,
      [averageSales, dealer_id]
    );
    return res.json({ msg: "done" });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function UploadLeadsXL(req, res) {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const { orderDealer, dealershipId } = req.body;
    if (!orderDealer || !dealershipId) {
      return res
        .status(400)
        .json({ message: "Order Dealer and Dealership ID are required" });
    }

    const filepath = req.file.path;
    const workbook = XLSX.readFile(filepath);
    const sheetname = workbook.SheetNames[0];
    const sheetData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetname], {
      defval: null,
    });

    if (sheetData.length === 0) {
      await fs.promises.unlink(filepath);
      return res.json({ msg: "No Data found in Excel" });
    }

    // Insert into uploads table
    const leadsuploadResult = await pool.query(
      `INSERT INTO leads_uploads (dealership_id, dealer_code)
     VALUES ($1, $2) RETURNING leads_upload_id, uploaded_at`,
      [dealershipId, orderDealer]
    );
    const { leads_upload_id, uploaded_at } = leadsuploadResult.rows[0];

    // Build bulk insert
    const insertValues = [];
    const placeholders = sheetData.map((row, i) => {
      insertValues.push(
        leads_upload_id,
        dealershipId,
        orderDealer,
        JSON.stringify(row)
      );
      const base = i * 4;
      return `($${base + 1}, $${base + 2}, $${base + 3}, $${base + 4}::jsonb)`;
    });

    await pool.query(
      `INSERT INTO leads_data (leads_upload_id, dealership_id, dealer_code, stock_data)
     VALUES ${placeholders.join(", ")}`,
      insertValues
    );

    return res.json({
      message: "Data uploaded successfully",
      leads_upload_id,
      uploaded_at,
      dealership_id: dealershipId,
      order_dealer: orderDealer,
      rows_inserted: sheetData.length,
    });
  } catch (error) {
    console.error("Error uploading Leads Excel:", error);
    res.status(500).json({ message: "Error uploading Leads file" });
  } finally {
    if (req.file?.path) {
      try {
        await fs.promises.unlink(req.file.path);
      } catch {}
    }
  }
}

module.exports = {
  CarQuotationForm,
  SubmitPan,
  UpdateInventory,
  SpecificQuotation,
  UploadXL,
  AverageSalesUpload,
  BBNDUploadXLCompare,
  UploadBBNDXL,
  UploadSalesXL,
  UploadLeadsXL,
};
