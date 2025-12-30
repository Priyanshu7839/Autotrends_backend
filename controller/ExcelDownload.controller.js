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


module.exports = {
    DownloadInventory
}