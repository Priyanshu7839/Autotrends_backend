const pool = require("../connection");
const XLSX = require('xlsx')

async function DownloadInventory(req, res) {

    const {dealer_id} = req.params;
    console.log(dealer_id)

  const result = await pool.query("SELECT * FROM dealer_inventory where dealer_id = $1",[dealer_id]);

  const worksheet = XLSX.utils.json_to_sheet(result.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Create buffer instead of file
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=dealer_inventory.xlsx"
);

return res.send(buffer);


}
async function DownloadBBNDInventory(req, res) {

    const {dealer_id} = req.params;
    console.log(dealer_id)

  const result = await pool.query("SELECT * FROM dealer_bbnd_inventory where dealer_id = $1",[dealer_id]);

  const worksheet = XLSX.utils.json_to_sheet(result.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Create buffer instead of file
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=dealer_inventory.xlsx"
);

return res.send(buffer);


}

async function DownloadMatchedExcel(req, res) {

    const {asm_id,dealer_id,selectedDealerCode} = req.params;


  const result = await pool.query(` WITH poolstk AS (
          SELECT 
              *,
              (
                  TRIM(LOWER(COALESCE("Variant Description", ''))) || 
                  TRIM(LOWER(COALESCE("Ext Color", '')))
              ) AS d
          FROM poolstock_data where asm_id = $1
      ),

      vna_calc AS (
          SELECT 
              vna.*,
              (
                  TRIM(LOWER(COALESCE(vna."Trim", ''))) || 
                  TRIM(LOWER(COALESCE(vna."Colour", '')))
              ) AS e
          FROM vna where dealer_id = $2 and ($3::TEXT = 'ALL' OR "Code" = $3)
      )

      SELECT 
          vna_calc.*,

          COALESCE((
              SELECT SUM(ps."All India")
              FROM poolstk ps
              WHERE ps.d = vna_calc.e
          ), 0) AS h,

          (
              SELECT ps2."Available Trim Quota [RO]"
              FROM poolstk ps2
              WHERE TRIM(LOWER(ps2."Variant Description")) = TRIM(LOWER(vna_calc."Trim"))
              ORDER BY ps2.id
              LIMIT 1
          ) AS i

      FROM vna_calc`,[asm_id,dealer_id,selectedDealerCode]);

  const worksheet = XLSX.utils.json_to_sheet(result.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Create buffer instead of file
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=matched_excel.xlsx"
);

return res.send(buffer);


}

async function DownloadOriginalVna(req, res) {

    const {dealer_id} = req.params;
    console.log(dealer_id)

  const result = await pool.query("SELECT * FROM vna where dealer_id = $1",[dealer_id]);

  const worksheet = XLSX.utils.json_to_sheet(result.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Create buffer instead of file
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=vna.xlsx"
);

return res.send(buffer);


}


async function DownloadPoolstock(req, res) {


  const result = await pool.query("SELECT * FROM poolstock_data");

  const worksheet = XLSX.utils.json_to_sheet(result.rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory");

  // Create buffer instead of file
  const buffer = XLSX.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  res.setHeader(
  "Content-Type",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
);
res.setHeader(
  "Content-Disposition",
  "attachment; filename=poolstock.xlsx"
);

return res.send(buffer);


}

module.exports = {
    DownloadInventory,
    DownloadBBNDInventory,
    DownloadMatchedExcel,
    DownloadOriginalVna,
    DownloadPoolstock
}