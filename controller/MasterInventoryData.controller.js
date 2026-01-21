const pool = require("../connection");


async function GetTotalCars(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const response = await pool.query(
      `
      SELECT COUNT(*)::int AS stock_count
      FROM (
        SELECT 1
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT 1
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined;
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ total_stock: response.rows[0].stock_count });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}


async function GetUniqueModels(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const response = await pool.query(
      `
      SELECT 
        "Model",
        COUNT(*)::int AS count
      FROM (
        SELECT "Model"
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT "Model"
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined
      GROUP BY "Model"
      ORDER BY count DESC;
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ uniqueModels: response.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}

async function GetUniqueVariants(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const response = await pool.query(
      `
      SELECT
        "Variant",
        COUNT(*)::int AS count,
        COUNT(*) FILTER (WHERE "Stock Status" = 'Free')::int AS free,
        COUNT(*) FILTER (WHERE "Stock Status" = 'Allocated')::int AS allocated
      FROM (
        SELECT "Variant", "Stock Status"
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT "Variant", "Stock Status"
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined
      GROUP BY "Variant"
      ORDER BY count DESC;
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ uniqueVariants: response.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}
async function GetAgeBuckets(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const response = await pool.query(
      `
      SELECT
        COALESCE("Model", 'TOTAL') AS "Model",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 0 AND 15)  AS "0-15",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 16 AND 30) AS "16-30",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 31 AND 45) AS "31-45",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 46 AND 60) AS "46-60",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 61 AND 75) AS "61-75",
        COUNT(*) FILTER (WHERE "Stock Age" >= 76)             AS "75+"
      FROM (
        SELECT "Model", "Stock Age"
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT "Model", "Stock Age"
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined
      GROUP BY GROUPING SETS (
        ("Model"),
        ()
      )
      ORDER BY
        CASE WHEN "Model" IS NULL THEN 1 ELSE 0 END,
        "Model";
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ ageBuckets: response.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}


async function GetAges(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 0 AND 15)  AS "0-15",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 16 AND 30) AS "16-30",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 31 AND 45) AS "31-45",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 46 AND 60) AS "46-60",
        COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 61 AND 75) AS "61-75",
        COUNT(*) FILTER (WHERE "Stock Age" >= 76)             AS "75+"
      FROM (
        SELECT "Stock Age"
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT "Stock Age"
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined;
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ ages: result.rows[0] }); // ✅ just return the object, not array
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}

async function GetStockStatusHeader(req, res) {
  const { dealer_id, order_dealer } = req.params;

  try {
    const result = await pool.query(
      `
      SELECT
        "Stock Status",
        COUNT(*)::int AS count
      FROM (
        SELECT "Stock Status"
        FROM dealer_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)

        UNION ALL

        SELECT "Stock Status"
        FROM dealer_bbnd_inventory
        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      ) combined
      GROUP BY "Stock Status"
      ORDER BY count DESC;
      `,
      [dealer_id, order_dealer]
    );

    return res.json({ stock_status: result.rows });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: String(error) });
  }
}


module.exports = {
 
  GetTotalCars,
  GetUniqueModels,
  GetUniqueVariants,
  GetAgeBuckets,

  GetAges,
  
  GetStockStatusHeader

};
