const pool = require("../connection");

async function GetTotalCars(req, res) {
  const { dealer_id, order_dealer,stock_status } = req.params;

  try {
    const response = await pool.query(
      `SELECT COUNT(*) as stock_count from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)`,
      [dealer_id, order_dealer,stock_status]
    );

    return res.json({ total_stock: response.rows?.[0]?.stock_count });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function CapitalStuck(req, res) {
  const { dealer_id, order_dealer,stock_status } = req.params;

  try {
    const response = await pool.query(
      `SELECT COALESCE(SUM("Basic Price"::NUMERIC), 0) AS capital_stuck from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)`,
      [dealer_id, order_dealer,stock_status]
    );

    return res.json({ capital_stuck: response.rows?.[0]?.capital_stuck });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetUniqueModels(req, res) {
  const { dealer_id, order_dealer,stock_status } = req.params;

  
 
  try {
    const response = await pool.query(
      `
    SELECT
      "Model",
      COUNT(*) AS count
    FROM dealer_inventory
    WHERE dealer_id = $1
      AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) 
      AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
    GROUP BY "Model"
    ORDER BY count DESC;
    `,
      [dealer_id, order_dealer,stock_status]
    );

    return res.json({ uniqueModels: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}
async function GetUniqueVariants(req, res) {
  const { dealer_id, order_dealer,stock_status } = req.params;
  try {
    const response = await pool.query(
      `
    SELECT
      "Variant",
      COUNT(*) AS count,
      COUNT(*) FILTER (WHERE "Stock Status" = 'Free') AS free,
  COUNT(*) FILTER (WHERE "Stock Status" = 'Allocated') AS allocated
    FROM dealer_inventory
    WHERE dealer_id = $1
      AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
    GROUP BY "Variant"
    ORDER BY count DESC;
    `,
      [dealer_id, order_dealer,stock_status]
    );

    return res.json({ uniqueVariants: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetAgeBuckets(req, res) {
  const { dealer_id, order_dealer,stock_status } = req.params;
  try {
    const response = await pool.query(
      `SELECT
  COALESCE("Model", 'TOTAL') AS "Model",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 0 AND 15)  AS "0-15",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 16 AND 30) AS "16-30",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 31 AND 45) AS "31-45",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 46 AND 60) AS "46-60",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 61 AND 75) AS "61-75",
  COUNT(*) FILTER (WHERE "Stock Age" >= 76)             AS "75+"
FROM dealer_inventory
WHERE dealer_id = $1
  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
  AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
GROUP BY GROUPING SETS (
  ("Model"),
  ()
)
ORDER BY
  CASE WHEN "Model" IS NULL THEN 1 ELSE 0 END,
  "Model";`,
      [dealer_id, order_dealer,stock_status]
    );

    return res.json({ ageBuckets: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetLastUpdateDate(req, res) {
  const { dealer_id } = req.params;

  try {
    const result = await pool.query(` SELECT MAX(updated_at AT TIME ZONE 'Asia/Kolkata') AS last_updated
FROM dealer_inventory
WHERE dealer_id = $1;`,[dealer_id]);

return res.json({'date':result?.rows?.[0]?.last_updated})
  } catch (error) {
     console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetAges (req,res) {
    const {dealer_id,order_dealer,stock_status} = req.params;

    try {
        const result = await pool.query(`
            SELECT
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 0 AND 15)  AS "0-15",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 16 AND 30) AS "16-30",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 31 AND 45) AS "31-45",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 46 AND 60) AS "46-60",
  COUNT(*) FILTER (WHERE "Stock Age" BETWEEN 61 AND 75) AS "61-75",
  COUNT(*) FILTER (WHERE "Stock Age" >= 76)             AS "75+"
FROM dealer_inventory
WHERE dealer_id = $1
  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3);`,[dealer_id,order_dealer,stock_status])

  return res.json({'ages':result?.rows})
    } catch (error) {
        console.log(error)
        return res.json({error:`${error}`})
    }
}


async function GetAllStocks (req,res){
    const {dealer_id,order_dealer,stock_status} = req.params;

    

    try {
        const result = await pool.query(`Select *  from dealer_inventory where dealer_id = $1  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3); `,[dealer_id,order_dealer,stock_status])

        return res.json({'stock':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }
}

async function GetStockStatusHeader (req,res){
  const {dealer_id,order_dealer} = req.params;
try {
        const result = await pool.query(`SELECT
  "Stock Status",
  COUNT(*) AS count
FROM dealer_inventory
WHERE dealer_id = $1
  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
GROUP BY "Stock Status"
ORDER BY count DESC;`,[dealer_id,order_dealer])
       

        return res.json({'stock_status':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }



}

module.exports = {
  CapitalStuck,
  GetTotalCars,
  GetUniqueModels,
  GetUniqueVariants,
  GetAgeBuckets,
  GetLastUpdateDate,
  GetAges,
  GetAllStocks,
  GetStockStatusHeader

};
