const pool = require('../connection')


async function GetLastUpdateDate(req, res) {
  const { dealer_id } = req.params;

  try {
    const result = await pool.query(` SELECT MAX(updated_at) AS last_updated
FROM dealer_demo_data
WHERE dealer_id = $1;`,[dealer_id]);


return res.json({'date':result?.rows?.[0]?.last_updated})
  } catch (error) {
     console.log(error);
    return res.json({ error: `${error}` });
  }
}


async function GetAllStocks (req,res){
    const {dealer_id,Model,Variants,availability} = req.params;

    

    try {
        const result = await pool.query(`Select *  from dealer_demo_data where dealer_id = $1  
      AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
      AND ($3::TEXT = 'ALL' OR "TRIM" = $3)
      AND ($4::TEXT = 'ALL' OR "Availability" = $4)

      order by "AGING" desc
          
          `,[dealer_id,Model,Variants,availability])

        return res.json({'stock':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }
}


async function GetTotalCars(req, res) {
  const { dealer_id,Model,Variants,availability } = req.params;
  

  try {
    const response = await pool.query(
      `SELECT COUNT(*) as stock_count from dealer_demo_data where dealer_id = $1  
      AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
      AND ($3::TEXT = 'ALL' OR "TRIM" = $3)
      AND ($4::TEXT = 'ALL' OR "Availability" = $4)
      
      `,
      [dealer_id,Model,Variants,availability]
    );

    return res.json({ total_stock: response.rows?.[0]?.stock_count });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetUniqueModels(req, res) {
  const { dealer_id,availability} = req.params;
  try {
    const response = await pool.query(
      `
    SELECT
      "MODEL",
      COUNT(*) AS count
    FROM dealer_demo_data
    WHERE dealer_id = $1
      AND ($2::TEXT = 'ALL' OR "Availability" = $2)


      
    GROUP BY "MODEL"
    ORDER BY count DESC;
    `,
      [dealer_id,availability]
    );

    return res.json({ uniqueModels: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}
async function GetUniqueVariants(req, res) {
  const { dealer_id,Model ,availability} = req.params;
 
  try {
  
    const response = await pool.query(
      `
    SELECT
      "TRIM",
      COUNT(*) AS count
    FROM dealer_demo_data
    WHERE dealer_id = $1
      AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
      AND ($3::TEXT = 'ALL' OR "Availability" = $3)

    GROUP BY "TRIM"
    ORDER BY count DESC;
    `,
      [dealer_id,Model,availability]
    );

    return res.json({ uniqueVariants: response?.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: `${error}` });
  }
}

async function GetAgeBuckets(req, res) {
  const { dealer_id, Model, Variants ,availability} = req.params;

  try {
    const response = await pool.query(
      `
        SELECT
          COALESCE("MODEL", 'TOTAL') AS "Model",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 0 AND 15
          ) AS "0-15",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 16 AND 30
          ) AS "16-30",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 31 AND 45
          ) AS "31-45",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 46 AND 60
          ) AS "46-60",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 61 AND 75
          ) AS "61-75",

          COUNT(*) FILTER (
            WHERE "AGING" >= 76
          ) AS "75+"

        FROM dealer_demo_data

        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
          AND ($3::TEXT = 'ALL' OR "TRIM" = $3)
      AND ($4::TEXT = 'ALL' OR "Availability" = $4)


        GROUP BY GROUPING SETS (
          ("MODEL"),
          ()
        )

        ORDER BY
          GROUPING("MODEL"),
          "MODEL";
      `,
      [dealer_id, Model, Variants,availability]
    );

    return res.json({
      ageBuckets: response.rows
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
async function GetAges(req, res) {
  const { dealer_id, Model, Variants,availability } = req.params;

  try {
    const result = await pool.query(
      `
        SELECT
          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 0 AND 15
          ) AS "0-15",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 16 AND 30
          ) AS "16-30",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 31 AND 45
          ) AS "31-45",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 46 AND 60
          ) AS "46-60",

          COUNT(*) FILTER (
            WHERE "AGING" BETWEEN 61 AND 75
          ) AS "61-75",

          COUNT(*) FILTER (
            WHERE "AGING" >= 76
          ) AS "76+"

        FROM dealer_demo_data

        WHERE dealer_id = $1
          AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
          AND ($3::TEXT = 'ALL' OR "TRIM" = $3)
      AND ($4::TEXT = 'ALL' OR "Availability" = $4)

      `,
      [dealer_id, Model, Variants,availability]
    );

    return res.json({
      ages: result.rows
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}


async function GetAvailability (req,res){
  const {dealer_id,Model,Variants} = req.params;
try {
        const result = await pool.query(`SELECT
  "Availability",
  COUNT(*) AS count
FROM dealer_demo_data
WHERE dealer_id = $1
      AND ($2::TEXT = 'ALL' OR "MODEL" = $2)
      AND ($3::TEXT = 'ALL' OR "TRIM" = $3)
GROUP BY "Availability"
ORDER BY count DESC;`,[dealer_id,Model,Variants])
       

        return res.json({'availability':result?.rows})
    } catch (error) {
         console.log(error)
        return res.json({error:`${error}`})
    }



}



module.exports ={
    GetLastUpdateDate,GetAllStocks,GetTotalCars,GetUniqueModels,GetUniqueVariants,GetAgeBuckets,GetAges,GetAvailability
}