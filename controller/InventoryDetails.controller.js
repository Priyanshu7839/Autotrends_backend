const pool = require("../connection");

async function FetchTotalInventoryUnits(req, res) {
 
    const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes && dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN main_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.upload_id   = l.upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];

  
  





  const { rows } = await pool.query(query, params);


  
   return res.json({ Units:rows?.length });


  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}

async function FastStars(req, res) {

   const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes && dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN main_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.upload_id   = l.upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];

  const { rows } = await pool.query(query, params);

      const FastStars = rows?.filter(
      (model) => model?.stock_data?.["Stock Age"] <= 15
    );
    const totalCapitalStuck = rows?.reduce((acc, items) => {
      const basicPrice = items?.stock_data["Basic Price"];
      return acc + basicPrice;
    }, 0);

    return res.json({
      msg: "Data Fetched",
      FastStarsCount: FastStars?.length,
      data: FastStars,
      totalCapitalStuck: totalCapitalStuck,
    });

  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}
async function SlowSnails(req, res) {

   const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes && dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN main_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.upload_id   = l.upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];

  const { rows } = await pool.query(query, params);

      const SlowSnails = rows?.filter(
      (model) => model?.stock_data?.["Stock Age"] >= 75
    );
    const totalCapitalStuck = rows?.reduce((acc, items) => {
      const basicPrice = items?.stock_data["Basic Price"];
      return acc + basicPrice;
    }, 0);

  
     return res.json({
      msg: "Data Fetched",
      SlowSnailsCount: SlowSnails?.length,
      data: SlowSnails,
      totalCapitalStuck: totalCapitalStuck,
    });

  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}

async function GetDealerCodes(req, res) {
  const { dealership_id } = req.body;

  try {
    const response = await pool.query(
      `SELECT dealer_code from dealer_codes where dealership_id = $1`,
      [dealership_id]
    );
    return res.json({ msg: response.rows });
  } catch (error) {
    console.log(error);
    return res.json({ error: error.response });
  }
}

async function InventoryList(req, res) {
  const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN main_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.upload_id   = l.upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];

  
  





  const { rows } = await pool.query(query, params);

  const uploaded_at = await pool.query(`Select uploaded_at from uploads where dealership_id = $1 ORDER BY uploaded_at DESC LIMIT 1`,[dealer_id])
 
 
  
  return res.json({ msg: "Data Fetched",stock:rows,lastUpdate:uploaded_at?.rows?.[0]?.uploaded_at});

  
    

   


  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}

async function InventoryListOrderDealer(req,res) {
 const { dealer_id, dealer_code } = req.body;

  try {
    const uploadData = await pool.query(
      `SELECT upload_id,uploaded_at FROM uploads WHERE dealership_id = $1 AND dealer_code = $2 ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id,dealer_code]
    );
    const upload_id = uploadData.rows?.[0]?.upload_id;
    const uploaded_at = uploadData.rows?.[0]?.uploaded_at;


    const response = await pool.query(
      `Select stock_data from main_inventory WHERE upload_id = $1 AND dealer_code = $2`,
      [upload_id, dealer_code]
    );

    const stock_data = response?.rows

    
      return res.json({ msg: "Data Fetched",stock:stock_data,lastUpdate:uploaded_at });

  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function BBNDInventoryList(req, res) {
  const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            bbnd_upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM bbnd_uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN bbnd_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.bbnd_upload_id   = l.bbnd_upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];
  
  const query2 = `
    WITH latest_uploads AS (
        SELECT 
            bbnd_upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM bbnd_uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN deleted_bbnd_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.bbnd_upload_id   = l.bbnd_upload_id
    WHERE l.rn = 1;
  `;





  const { rows } = await pool.query(query, params);

  const {rows2} = await pool.query(query2,params);
  const uploaded_at = await pool.query(`Select uploaded_at from bbnd_uploads where dealership_id = $1 ORDER BY uploaded_at DESC LIMIT 1`,[dealer_id])
 
  
  return res.json({ msg: "Data Fetched",stock:rows,deleted:rows2,lastUpdate:uploaded_at?.rows?.[0]?.uploaded_at });

  
    

   


  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}

async function BBNDInventoryListOrderDealer(req, res) {
  const { dealer_id, dealer_code } = req.body;

  try {
    const bbnduploadData = await pool.query(
      `SELECT bbnd_upload_id,uploaded_at FROM bbnd_uploads WHERE dealership_id = $1 AND dealer_code = $2 ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id,dealer_code]
    );
    const bbnd_upload_id = bbnduploadData.rows?.[0]?.bbnd_upload_id;
    const uploaded_at = bbnduploadData.rows?.[0]?.uploaded_at;


    const response = await pool.query(
      `Select stock_data from bbnd_inventory WHERE bbnd_upload_id = $1 AND dealer_code = $2`,
      [bbnd_upload_id, dealer_code]
    );

    const stock_data = response?.rows

     const deleted = await pool.query(`Select stock_data,created_at from deleted_bbnd_inventory where dealer_id = $1 and dealer_code = $2`,[dealer_id,dealer_code])
      return res.json({ msg: "Data Fetched",stock:stock_data,deleted:deleted?.rows,upload_at:uploaded_at });

  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function GetBBNDInventoryStockUnits(req, res) {
    const { dealer_id,dealerCodes } = req.body;
  if(dealerCodes.length === 0){

    return res.json({"msg":"Dealer codes empty"})
  }

  try {
   const query = `
    WITH latest_uploads AS (
        SELECT 
            bbnd_upload_id,
            uploaded_at,
            dealer_code,
            ROW_NUMBER() OVER (PARTITION BY dealer_code ORDER BY uploaded_at DESC) AS rn
        FROM bbnd_uploads
        WHERE dealership_id = $1
          AND dealer_code = ANY($2::text[])
    )
    SELECT 
        i.*, 
        l.uploaded_at
    FROM latest_uploads l
    JOIN bbnd_inventory i
      ON i.dealer_code = l.dealer_code
     AND i.bbnd_upload_id   = l.bbnd_upload_id
    WHERE l.rn = 1;
  `;

  const params = [dealer_id,dealerCodes];

  const { rows } = await pool.query(query, params);

  return res.json({ msg: "Data Fetched",Units:rows?.length });

  
    

   


  } catch (error) {
    console.log(error)
    return res.json({ msg: `${error}` });
  }
}

async function FetchFestiveSales(req,res) {
  try {

    const { dealership_id,dealer_code, toDate,fromDate,Model, Variant,Insurance,Finance } = req.body;
    
   

if (!fromDate || !toDate) {
  return res.status(400).json({ message: "Both fromDate and toDate are required" });
}




const values = [fromDate,toDate,dealership_id,dealer_code];
const clauses = [`TO_DATE(stock_data->>'Delivery Date', 'DD/MM/YYYY')
        BETWEEN TO_DATE($1, 'DD/MM/YYYY') AND TO_DATE($2, 'DD/MM/YYYY') AND dealership_id = $3 AND dealer_code = $4`]

        if (Model) {
      values.push(Model);
      clauses.push(`stock_data->>'Model' = $${values.length}`);
    }

    if (Variant) {
      values.push(Variant);
      clauses.push(`stock_data->>'Variant' = $${values.length}`);
    }

    if (Insurance) {
      values.push(Insurance);
      clauses.push(`stock_data->>'Insurance Company Name' = $${values.length}`);
    }

   
    if (Finance) {
      values.push(Variant);
      clauses.push(`stock_data->>'DSA/Financier' = $${values.length}`);
    }
   

 const query = `SELECT * FROM sales_data WHERE ${clauses.join(' AND ')}`;

 const response = await pool.query(query, values);
    return res.json({ Sales: response.rows });

    
  } catch (error) {
    console.error("Error Fetching Sales",error)
    res.status(500).json({message:"Error Fetching Deals"});
  }
}

async function CustomerSalesHeader(req, res) {
  const { dealership_id } = req.body;

  try {
    const response = await pool.query(`
      SELECT DISTINCT stock_data->>'Model' AS value, 'Model' AS type
      FROM sales_data
      WHERE stock_data ? 'Model' AND dealership_id = $1

      UNION

      SELECT DISTINCT stock_data->>'Variant' AS value, 'Variant' AS type
      FROM sales_data
      WHERE stock_data ? 'Variant' AND dealership_id = $1

      UNION

      SELECT DISTINCT stock_data->>'Insurance company name' AS value, 'Insurance' AS type
      FROM sales_data
      WHERE stock_data ? 'Variant' AND dealership_id = $1

      UNION

      SELECT DISTINCT stock_data->>'DSA/Financier' AS value, 'Finance' AS type
      FROM sales_data
      WHERE stock_data ? 'Variant' AND dealership_id = $1



    `, [dealership_id]);

    return res.json({ filters: response.rows });
  } catch (error) {
    console.error("Error Fetching Headers", error);
    res.status(500).json({ message: "Error Fetching Headers" });
  }
}

async function FetchCustomerSales(req, res) {
  const { dealership_id, Model, Variant, Year,Month } = req.body;

  try {
    // start with the dealership id as $1
    const values = [dealership_id];
    const clauses = ['dealership_id = $1'];

    // add Model if provided (truthy)
    if (Model) {
      values.push(Model);
      clauses.push(`stock_data->>'Model' = $${values.length}`);
    }

    // add Variant if provided
    if (Variant) {
      values.push(Variant);
      clauses.push(`stock_data->>'Variant' = $${values.length}`);
    }

    // add Year if provided and valid number
    if (Year !== undefined && Year !== null && String(Year).trim() !== '') {
     
      const yearNumber = Number(Year);
      if (!Number.isNaN(yearNumber)) {
        values.push(yearNumber);
        // cast extracted year to int and compare to the numeric param
        clauses.push(`EXTRACT(YEAR FROM TO_DATE(stock_data->>'Confirm Date', 'DD/MM/YYYY'))::int = $${values.length}::int`);
      }
    }

    if (Month) {
      values.push(Number(Month));
      clauses.push(
        `EXTRACT(MONTH FROM TO_DATE(stock_data->>'Delivery Date', 'DD/MM/YYYY')) = $${values.length}`
      );
    }

    const query = `SELECT * FROM sales_data WHERE ${clauses.join(' AND ')}`;
    // (optional) console.log(query, values);

    const response = await pool.query(query, values);
    return res.json({ Sales: response.rows });
  } catch (error) {
    console.error("Error Fetching Sales", error);
    res.status(500).json({ message: "Error Fetching Sales" });
  }
}





module.exports = {
  FetchTotalInventoryUnits,
  FastStars,
  SlowSnails,
  GetDealerCodes,
  InventoryList,
  BBNDInventoryList,
  BBNDInventoryListOrderDealer,
  GetBBNDInventoryStockUnits,
  InventoryListOrderDealer,
  FetchFestiveSales,
  CustomerSalesHeader,
  FetchCustomerSales
};
