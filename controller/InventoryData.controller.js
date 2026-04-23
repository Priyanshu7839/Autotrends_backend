const pool = require("../connection");

async function GetTotalCars(req, res) {
  const { dealer_id, order_dealer,stock_status,Model,Variants,Year } = req.params;
  

  try {
    const response = await pool.query(
      `SELECT COUNT(*) as stock_count from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3) 
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5) and ($6::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $6 || '%')
      
      `,
      [dealer_id, order_dealer,stock_status,Model,Variants,Year]
    );

    return res.json({ total_stock: response.rows?.[0]?.stock_count });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function CapitalStuck(req, res) {
  const { dealer_id, order_dealer,stock_status,Model,Variants,Year } = req.params;

  try {
    const response = await pool.query(
      `SELECT COALESCE(SUM("Basic Price"::NUMERIC), 0) AS capital_stuck from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3) 
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5) and ($6::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $6 || '%')
      `,
      [dealer_id, order_dealer,stock_status,Model,Variants,Year]
    );

    return res.json({ capital_stuck: response.rows?.[0]?.capital_stuck });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetUniqueModels(req, res) {
  const { dealer_id, order_dealer,stock_status ,Year} = req.params;

  
 
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
      and ($4::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $4 || '%')

      
    GROUP BY "Model"
    ORDER BY count DESC;
    `,
      [dealer_id, order_dealer,stock_status,Year]
    );

    return res.json({ uniqueModels: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}
async function GetUniqueVariants(req, res) {
  const { dealer_id, order_dealer,stock_status,Model,Year } = req.params;
  console.log(Model)
 
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
      AND ($4::TEXT = 'ALL' OR "Model" = $4) and ($5::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $5 || '%')
    GROUP BY "Variant"
    ORDER BY count DESC;
    `,
      [dealer_id, order_dealer,stock_status,Model,Year]
    );

    return res.json({ uniqueVariants: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetAgeBuckets(req, res) {
  const { dealer_id, order_dealer,stock_status,Model,Variants,Year } = req.params;
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
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5)
      and ($6::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $6 || '%')

GROUP BY GROUPING SETS (
  ("Model"),
  ()
)
ORDER BY
  CASE WHEN "Model" IS NULL THEN 1 ELSE 0 END,
  "Model";`,
      [dealer_id, order_dealer,stock_status,Model,Variants,Year]
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
    const result = await pool.query(` SELECT MAX(updated_at) AS last_updated
FROM dealer_inventory
WHERE dealer_id = $1;`,[dealer_id]);

return res.json({'date':result?.rows?.[0]?.last_updated})
  } catch (error) {
     console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetAges (req,res) {
    const {dealer_id,order_dealer,stock_status,Model,Variants,Year} = req.params;

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
  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5) and ($6::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $6 || '%')
  
  `,[dealer_id,order_dealer,stock_status,Model,Variants,Year])

  return res.json({'ages':result?.rows})
    } catch (error) {
        console.log(error)
        return res.json({error:`${error}`})
    }
}


async function GetAllStocks (req,res){
    const {dealer_id,order_dealer,stock_status,Model,Variants,Year} = req.params;

    

    try {
        const result = await pool.query(`Select *  from dealer_inventory where dealer_id = $1  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5) and ($6::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $6 || '%')
      ORDER BY "Stock Age" desc
          
          `,[dealer_id,order_dealer,stock_status,Model,Variants,Year])

        return res.json({'stock':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }
}

async function GetStockStatusHeader (req,res){
  const {dealer_id,order_dealer,Model,Variants,Year} = req.params;
try {
        const result = await pool.query(`SELECT
  "Stock Status",
  COUNT(*) AS count
FROM dealer_inventory
WHERE dealer_id = $1
  AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
      AND ($3::TEXT = 'ALL' OR "Model" = $3)
      AND ($4::TEXT = 'ALL' OR "Variant" = $4) and ($5::TEXT = 'ALL' OR "Sign Off Date" LIKE '%' || $5 || '%')

GROUP BY "Stock Status"
ORDER BY count DESC;`,[dealer_id,order_dealer,Model,Variants,Year])
       

        return res.json({'stock_status':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }



}


async function FastStars(req, res) {
  const { dealer_id, order_dealer } = req.params;


  try {
    const query = `
    select * from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
  `;

    const params = [dealer_id, order_dealer];

    const { rows } = await pool.query(query, params);
    

    const FastStars = rows?.filter(
      (model) => model?.["Stock Age"] <= 15
    );
    const totalCapitalStuck = rows?.reduce((acc, items) => {
      const basicPrice = items?.["Basic Price"];
      return acc + Number(basicPrice);
    }, 0);

    return res.json({
      msg: "Data Fetched",
      FastStarsCount: FastStars?.length,
      data: FastStars,
      totalCapitalStuck: totalCapitalStuck,
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: `${error}` });
  }
}
async function SlowSnails(req, res) {
  const { dealer_id, order_dealer } = req.params;
  

  try {
    const query = `
     select * from dealer_inventory where dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2)
  `;

    const params = [dealer_id, order_dealer];

    const { rows } = await pool.query(query, params);

    const SlowSnails = rows?.filter(
      (model) => model?.["Stock Age"] >= 75
    );
    const totalCapitalStuck = rows?.reduce((acc, items) => {
      const basicPrice = items?.["Basic Price"];
      return acc + Number(basicPrice);
    }, 0);

    return res.json({
      msg: "Data Fetched",
      SlowSnailsCount: SlowSnails?.length,
      data: SlowSnails,
      totalCapitalStuck: totalCapitalStuck,
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: `${error}` });
  }
}

async function MfgDate(req, res) {
  const { dealer_id, order_dealer,stock_status,Model,Variants } = req.params;
  

  try {
    const query = `
     SELECT 
  RIGHT("Sign Off Date", 4) AS year,
  COUNT(*) AS count FROM dealer_inventory
WHERE "Sign Off Date" IS NOT NULL and dealer_id = $1 AND ($2::TEXT = 'ALL' OR "Order Dealer" = $2) 
 AND ($3::TEXT = 'ALL' OR "Stock Status" = $3)
      AND ($4::TEXT = 'ALL' OR "Model" = $4)
      AND ($5::TEXT = 'ALL' OR "Variant" = $5)
GROUP BY year
ORDER BY year
  `;

    const params = [dealer_id, order_dealer,stock_status,Model,Variants];

    const { rows } = await pool.query(query, params);


    return res.json({
      msg: "Data Fetched",
     data:rows
    });
  } catch (error) {
    console.log(error);
    return res.json({ msg: `${error}` });
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
  GetStockStatusHeader,
  FastStars,
  SlowSnails,
  MfgDate

};
