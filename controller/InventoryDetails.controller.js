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


module.exports = {
  FetchTotalInventoryUnits,
  FastStars,
  SlowSnails,
  GetDealerCodes,
  InventoryList,
  BBNDInventoryList,
  BBNDInventoryListOrderDealer,
  GetBBNDInventoryStockUnits,
  InventoryListOrderDealer
};
