const pool = require("../connection");


async function getVnaComputedData(req, res) {

  const {asm_id,dealer_id,selectedDealerCode} = req.body;

  if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  
  
  if(!asm_id){
      return res.status(400).json({ msg: "No asm_id" });
  }
  if(!selectedDealerCode){
    return res.status(400).json({msg:"No Dealer code"})
  }

  try {
    const result = await pool.query(`
    WITH poolstk AS (
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

      FROM vna_calc;
    `,[asm_id,dealer_id,selectedDealerCode]);

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something broke" });
  }
}


async function GetLastUpdateDateVNA(req, res) {
  const { dealer_id } = req.params;
 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  try {
    const result = await pool.query(` SELECT MAX(last_updated)  AS last_updated
FROM vna
WHERE dealer_id = $1;`,[dealer_id]);

return res.json({'date':result?.rows?.[0]?.last_updated})
  } catch (error) {
     console.log(error);
    return res.json({ error: `${error}` });
  }
}
async function GetLastUpdateDatepoolstock(req, res) {
  const { dealer_id } = req.params;
 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  try {
    const result = await pool.query(` SELECT MAX(last_updated)  AS last_updated
FROM poolstock_data
WHERE asm_id = $1;`,[dealer_id]);

return res.json({'date':result?.rows?.[0]?.last_updated})
  } catch (error) {
     console.log(error);
    return res.json({ error: `${error}` });
  }
}



async function getUniqueCodes(req, res) {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      SELECT DISTINCT "Code"
      FROM vna
      WHERE "Code" IS NOT NULL
      ORDER BY "Code"
    `);

    const codes = result.rows.map(row => row.Code);

    return res.json({
      data: codes
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch unique codes",
      error: err.message
    });
  } finally {
    client.release();
  }
}


async function GetPoolStock(req,res) {
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select * from poolstock_data
    `);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch poolstock data",
      error: err.message
    });
  } finally {
    client.release();
  }
}

async function GetOriginalVna(req,res) {
const {dealer_id,selectedDealerCode} = req.body

 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }

  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select * from vna where dealer_id = $1 and ($2::TEXT = 'ALL' OR "Code" = $2)
    `,[dealer_id,selectedDealerCode]);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch vna",
      error: err.message
    });
  } finally {
    client.release();
  }
}

async function getModels(req,res) {
  const {dealer_id,selectedDealerCode} = req.body
 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT TRIM(SPLIT_PART("Trim", ' ', 1)) AS model,COUNT(*) AS count FROM vna where dealer_id = $1 and ($2::TEXT = 'ALL' OR "Code" = $2) GROUP BY model ORDER BY count DESC 
    `,[dealer_id,selectedDealerCode]);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Models",
      error: err.message
    });
  } finally {
    client.release();
  }
}

async function getVariants(req,res) {
  const {dealer_id,selectedDealerCode} = req.body
 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT "Trim", COUNT(*) AS count from vna where dealer_id = $1 and ($2::TEXT = 'ALL' OR "Code" = $2) GROUP BY "Trim" ORDER BY count DESC
    `,[dealer_id,selectedDealerCode]);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Variants",
      error: err.message
    });
  } finally {
    client.release();
  }
}

async function getColour(req,res) {
  const {dealer_id,selectedDealerCode} = req.body
 if(!dealer_id){

      return res.status(400).json({ msg: "No dealer_id" });
  
  }
  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT "Colour", COUNT(*) AS count from vna where dealer_id = $1 and ($2::TEXT = 'ALL' OR "Code" = $2) GROUP BY "Colour" ORDER BY count DESC
    `,[dealer_id,selectedDealerCode]);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Colour",
      error: err.message
    });
  } finally {
    client.release();
  }
}


async function getPoolstockModels(req,res) {
  

  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT "Model" as model, COUNT(*) AS count from poolstock_data  GROUP BY model ORDER BY count DESC
    `);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch poolstock Models",
      error: err.message
    });
  } finally {
    client.release();
  }
}


async function getpoolstockVariants(req,res) {
  

  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT "Variant Description" as "Trim", COUNT(*) AS count from poolstock_data GROUP BY "Trim" ORDER BY count DESC
    `);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Variants",
      error: err.message
    });
  } finally {
    client.release();
  }
}

async function getpoolstockColour(req,res) {
 

  
  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select DISTINCT "Ext Color" as "Colour", COUNT(*) AS count from poolstock_data  GROUP BY "Colour" ORDER BY count DESC
    `);

    

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Colour",
      error: err.message
    });
  } finally {
    client.release();
  }
}



async function getDealerships(req,res) {

  const client = await pool.connect();

  try {
    const result = await client.query(`
      Select pk_id,dealership_name from onboarded_dealers
    `);

    return res.json({
      data: result.rows
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({
      msg: "Failed to fetch Variants",
      error: err.message
    });
  } finally {
    client.release();
  }
}




module.exports = {getVnaComputedData,GetLastUpdateDateVNA,GetLastUpdateDatepoolstock,getUniqueCodes,GetPoolStock,GetOriginalVna,getModels,getVariants,getDealerships,getColour,getPoolstockModels,getpoolstockVariants,getpoolstockColour}