import PDFDocument from "pdfkit";
import pool from "../connection.js";

// export async function generateInventoryPDF(req, res) {
//   const {  dealershipName, dealer_id } = req.body;

//   const response = await pool.query(
//     `Select "Stock Status","Stock Age","Model","Variant","Vin Number","Cust Name" from dealer_inventory where dealer_id = $1`,
//     [dealer_id],
//   );

//   const mainUnits = await pool.query(
//     `SELECT COUNT(*) as stock_count from dealer_inventory where dealer_id = $1`,
//     [dealer_id],
//   );
//   const bbndUnits = await pool.query(
//     `SELECT COUNT(*) as stock_count from dealer_bbnd_inventory where dealer_id = $1`,
//     [dealer_id],
//   );
//   const capital_stuck = await pool.query(
//     `SELECT COALESCE(SUM("Basic Price"::NUMERIC), 0) AS capital_stuck from dealer_inventory where dealer_id = $1`,
//     [dealer_id],
//   );
//   const modelcount = await pool.query(
//     `SELECT COUNT(DISTINCT "Model") AS total_models
// FROM (
//   SELECT "Model" FROM dealer_inventory where dealer_id = $1
//   UNION
//   SELECT "Model" FROM dealer_bbnd_inventory where dealer_id = $1
// ) AS models`,
//     [dealer_id],
//   );
//   const variantcount = await pool.query(
//     `SELECT COUNT(DISTINCT "Variant") AS total_variants
// FROM (
//   SELECT "Variant" FROM dealer_inventory where dealer_id = $1
//   UNION
//   SELECT "Variant" FROM dealer_bbnd_inventory where dealer_id = $1
// ) AS variants;`,
//     [dealer_id],
//   );

//   const stock_header = await pool.query(
//     `SELECT
//   "Stock Status",
//   COUNT(*) AS count
// FROM dealer_inventory where dealer_id = $1


// GROUP BY "Stock Status"
// ORDER BY count DESC;`,
//     [dealer_id],
//   );

//   console.log(mainUnits?.rows);

//   const stockStatusRows = stock_header?.rows;
//   const inventoryRows = response.rows;

//   const doc = new PDFDocument({ margin: 40 });

//   res.setHeader("Content-Type", "application/pdf");
//   res.setHeader("Content-Disposition", "attachment; filename=inventory.pdf");

//   doc.pipe(res);

//   /* -------------------------
//     HEADER
//   ------------------------- */

//   doc
//   .font("Helvetica")
//   .fontSize(22)
//   .fillColor("#1a1a1a")
//   .text(`Daily Report For ${dealershipName}`, { align: "center" });

// doc.moveDown(0.5);


// doc.moveDown(0.5);

// doc
//   .fontSize(11)
//   .fillColor("#666")
//   .text("Today's inventory stock has been uploaded.", { align: "center" });

// doc.moveDown(2);

//   /* -------------------------
//     SUMMARY BOXES (LIKE IMAGE)
//   ------------------------- */

//   const startX = 50;
//   const startY = doc.y;
//   const boxWidth = 160;
//   const boxHeight = 60;
//   const gap = 20;

//   const stats = [
//     [
//       "Total Units",
//       Number(mainUnits?.rows?.[0]?.stock_count) +
//         Number(bbndUnits?.rows?.[0]?.stock_count),
//     ],
//     ["Main Units", mainUnits?.rows?.[0]?.stock_count],
//     ["BBND Units", bbndUnits?.rows?.[0]?.stock_count],
//     [
//       "Capital Stuck",
//       `Rs. ${parseInt(capital_stuck?.rows?.[0]?.capital_stuck).toLocaleString("en-In")}`,
//     ],
//     ["Models", modelcount?.rows?.[0]?.total_models],
//     ["Variants", variantcount?.rows?.[0]?.total_variants],
//   ];

//   stockStatusRows.forEach((row) => {
//     stats.push([row["Stock Status"], Number(row.count)]);
//   });

//   let x = startX;
//   let yBox = startY;

//   stats.forEach((stat, i) => {
//     doc
//       .roundedRect(x, yBox, boxWidth, boxHeight, 8)
//       .fillAndStroke("#3B6FB6", "#3B6FB6");

//     doc
//       .fillColor("white")
//       .fontSize(12)
//       .text(stat[0], x + 15, yBox + 15);

//     doc.fontSize(18).text(stat[1].toString(), x + 15, yBox + 35);

//     doc.fillColor("black");

//     x += boxWidth + gap;

//     if ((i + 1) % 3 === 0) {
//       x = startX;
//       yBox += boxHeight + gap;
//     }
//   });

//   doc.moveDown(6);

//   /* -------------------------
//     INVENTORY TABLE
//   ------------------------- */

//   doc.fontSize(14).text("Inventory Stock", { underline: true });
//   doc.moveDown();

//   const tableTop = doc.y;

//   const colX = {
//     model: 50,
//     variant: 130,
//     color: 270,
//     age: 380,
//     vin: 430,
//     cust: 560,
//   };

//   const drawTableHeader = (y) => {

//   doc
//     .rect(40, y - 5, 520, 20)
//     .fill("#f2f2f2");

//   doc
//     .fillColor("#000")
//     .fontSize(9)
//     .text("Model", colX.model, y)
//     .text("Variant", colX.variant, y)
//     .text("Stock Status", colX.color, y)
//     .text("Stock Age", colX.age, y)
//     .text("Vin Number", colX.vin, y);
// };

//   let y = tableTop;

//   drawTableHeader(y);
//   y += 20;

//   inventoryRows.forEach((row, i) => {

//   if (y > doc.page.height - 80) {
//     doc.addPage()
//     y = 50
//     drawTableHeader(y)
//     y += 20
//   }

//   if (i % 2 === 0) {
//     doc.rect(40, y - 2, 520, 18).fill("#fafafa")
//   }

//   doc.fillColor("#000")

//   doc
//     .fontSize(8)
//     .text(row.Model || "", colX.model, y, { width: 70 })
//     .text(row.Variant || "", colX.variant, y, { width: 130 })
//     .text(row["Stock Status"] || "", colX.color, y, { width: 100 })
//     .text(String(row["Stock Age"] || ""), colX.age, y, { width: 60 })
//     .text(String(row["Vin Number"] || ""), colX.vin, y, { width: 120 });

//   y += 18;
// });

//   doc.moveDown(1);

//   /* -------------------------
//     TIV TABLE
//   ------------------------- */

//   //  doc.fontSize(14).text("Transit Inventory (TIV)", { underline: true,align:"left" });
//   //  doc.moveDown();

//   //  let tivY = doc.y;

//   //  doc
//   //    .text("Model", 50, tivY)
//   //    .text("In Transit", 300, tivY);

//   //  tivY += 20;

//   //  tivRows.forEach(row => {
//   //    doc
//   //      .text(row.model, 50, tivY)
//   //      .text(row.transit.toString(), 300, tivY);

//   //    tivY += 20;
//   //  });

//   //  doc.moveDown(3);

//   /* -------------------------
//     FOOTER
//   ------------------------- */

// const pageWidth = doc.page.width

// doc
// .font('Helvetica-Bold')
//   .fontSize(12)
//   .fillColor("#000")
//   .text("Thank you for using Autotrends.ai.", 0, doc.page.height - 50, {
//     align: "center",
//     width: pageWidth
//   })

//   doc.end();
// }




export async function generateInventoryPDF(dealershipName, dealer_id) {

  const response = await pool.query(
    `SELECT "Stock Status","Stock Age","Model","Variant","Vin Number","Cust Name"
     FROM dealer_inventory WHERE dealer_id = $1`,
    [dealer_id]
  );

  const mainUnits = await pool.query(
    `SELECT COUNT(*) as stock_count
     FROM dealer_inventory WHERE dealer_id = $1`,
    [dealer_id]
  );

  const bbndUnits = await pool.query(
    `SELECT COUNT(*) as stock_count
     FROM dealer_bbnd_inventory WHERE dealer_id = $1`,
    [dealer_id]
  );

  const capital_stuck = await pool.query(
    `SELECT COALESCE(SUM("Basic Price"::NUMERIC),0) AS capital_stuck
     FROM dealer_inventory WHERE dealer_id = $1`,
    [dealer_id]
  );

  const modelcount = await pool.query(
    `SELECT COUNT(DISTINCT "Model") AS total_models
     FROM (
        SELECT "Model" FROM dealer_inventory WHERE dealer_id = $1
        UNION
        SELECT "Model" FROM dealer_bbnd_inventory WHERE dealer_id = $1
     ) AS models`,
    [dealer_id]
  );

  const variantcount = await pool.query(
    `SELECT COUNT(DISTINCT "Variant") AS total_variants
     FROM (
        SELECT "Variant" FROM dealer_inventory WHERE dealer_id = $1
        UNION
        SELECT "Variant" FROM dealer_bbnd_inventory WHERE dealer_id = $1
     ) AS variants`,
    [dealer_id]
  );

  const stock_header = await pool.query(
    `SELECT "Stock Status", COUNT(*) AS count
     FROM dealer_inventory
     WHERE dealer_id = $1
     GROUP BY "Stock Status"
     ORDER BY count DESC`,
    [dealer_id]
  );

  const inventoryRows = response.rows;
  const stockStatusRows = stock_header.rows;

  return new Promise((resolve, reject) => {

    const doc = new PDFDocument({ margin: 40 });
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));

    doc.on("end", () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });

    doc.on("error", reject);

    /* ---------- HEADER ---------- */

    doc
      .font("Helvetica-Bold")
      .fontSize(22)
      .text(`Daily Report For ${dealershipName}`, { align: "center" });

    doc.moveDown(0.5);

    doc
      .font("Helvetica")
      .fontSize(11)
      .fillColor("#555")
      .text("Today's inventory stock has been uploaded.", { align: "center" });

    doc.moveDown(2);

    /* ---------- STATS ---------- */

    const stats = [
      [
        "Total Units",
        Number(mainUnits.rows[0].stock_count) +
        Number(bbndUnits.rows[0].stock_count)
      ],
      ["Main Units", mainUnits.rows[0].stock_count],
      ["BBND Units", bbndUnits.rows[0].stock_count],
      [
        "Capital Stuck",
        `Rs. ${parseInt(capital_stuck.rows[0].capital_stuck).toLocaleString("en-IN")}`
      ],
      ["Models", modelcount.rows[0].total_models],
      ["Variants", variantcount.rows[0].total_variants],
    ];

    stockStatusRows.forEach(row => {
      stats.push([row["Stock Status"], Number(row.count)]);
    });

    const startX = 50;
    const boxWidth = 160;
    const boxHeight = 60;
    const gap = 20;

    let x = startX;
    let yBox = doc.y;

    stats.forEach((stat, i) => {

      doc.roundedRect(x, yBox, boxWidth, boxHeight, 6).fill("#2f5fa7");

      doc.fillColor("white")
        .fontSize(10)
        .text(stat[0], x + 12, yBox + 12);

      doc.fontSize(18)
        .text(stat[1].toString(), x + 12, yBox + 30);

      x += boxWidth + gap;

      if ((i + 1) % 3 === 0) {
        x = startX;
        yBox += boxHeight + gap;
      }

    });

    doc.moveDown(6);

    /* ---------- TABLE ---------- */

    doc
      .font("Helvetica-Bold")
      .fontSize(16)
      .text("Inventory Stock", { align: "center", underline: true });

    doc.moveDown(1.5);

    const colX = {
      model: 50,
      variant: 130,
      status: 270,
      age: 380,
      vin: 430
    };

    const drawHeader = (y) => {

      doc.rect(40, y - 5, 520, 20).fill("#f2f2f2");

      doc.fillColor("#000")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Model", colX.model, y)
        .text("Variant", colX.variant, y)
        .text("Stock Status", colX.status, y)
        .text("Stock Age", colX.age, y)
        .text("VIN Number", colX.vin, y);

      doc.font("Helvetica");

    };

    let y = doc.y;

    drawHeader(y);
    y += 20;

    inventoryRows.forEach((row, i) => {

      if (y > doc.page.height - 80) {
        doc.addPage();
        y = 50;
        drawHeader(y);
        y += 20;
      }

      if (i % 2 === 0) {
        doc.rect(40, y - 2, 520, 18).fill("#fafafa");
      }

      doc.fillColor("#000")
        .fontSize(8)
        .text(row.Model || "", colX.model, y, { width: 70 })
        .text(row.Variant || "", colX.variant, y, { width: 130 })
        .text(row["Stock Status"] || "", colX.status, y, { width: 100 })
        .text(String(row["Stock Age"] || ""), colX.age, y, { width: 60 })
        .text(String(row["Vin Number"] || ""), colX.vin, y, { width: 120 });

      y += 18;

    });

    /* ---------- FOOTER ---------- */

    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor("#444")
      .text("Thank you for using Autotrends.ai.", 0, doc.page.height - 50, {
        align: "center",
        width: doc.page.width
      });

    doc.end();

  });
}

export async function downloadInventoryPdf(req,res){

    const {dealershipName,dealer_id} = req.body

    const pdfBuffer = await generateInventoryPDF(dealershipName, dealer_id)

res.setHeader("Content-Type","application/pdf")
res.setHeader("Content-Disposition","attachment; filename=inventory.pdf")

res.send(pdfBuffer)
}

