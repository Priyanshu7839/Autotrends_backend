const pool = require("../connection");

async function FetchTotalInventoryUnits(req, res) {
  const { dealership_id } = req.body;

  try {
    const uploadResult = await pool.query(
      `Select upload_id,uploaded_at from uploads where "dealership_id" = $1 ORDER BY  uploaded_at DESC LIMIT 1 `,
      [dealership_id]
    );

    const upload_id = uploadResult?.rows[0]?.upload_id;

    try {
      const response = await pool.query(
        `Select * from main_inventory WHERE "upload_id" = $1`,
        [upload_id]
      );

      return res.json({ Units: response.rows?.length });
    } catch (error) {
      console.log(error);
      return res.json({ error: error.response });
    }
  } catch (error) {
    console.log(error);
    return res.json({ error: error.response });
  }
}

async function FastStars(req, res) {
  const { DealerCodes } = req.body;
  try {
    const response = await pool.query(
      `Select * from kia_inventory WHERE "Order Dealer" = ANY($1)`,
      [DealerCodes]
    );
    const FastStars = response?.rows?.filter(
      (model) => model["Stock Age"] <= 15
    );
    const totalCapitalStuck = response?.rows?.reduce((acc, items) => {
      const basicPrice = items["Basic Price"];
      return acc + basicPrice;
    }, 0);

    return res.json({
      msg: "Data Fetched",
      FastStarsCount: FastStars?.length,
      data: FastStars,
      totalCapitalStuck: totalCapitalStuck,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: error.response });
  }
}
async function SlowSnails(req, res) {
  const { DealerCodes } = req.body;
  try {
    const response = await pool.query(
      `Select * from kia_inventory WHERE "Order Dealer" = ANY($1)`,
      [DealerCodes]
    );
    const SlowSnails = response?.rows?.filter(
      (model) => model["Stock Age"] >= 75
    );

    const totalCapitalStuck = response?.rows?.reduce((acc, items) => {
      const basicPrice = items["Basic Price"];
      return acc + basicPrice;
    }, 0);

    return res.json({
      msg: "Data Fetched",
      SlowSnailsCount: SlowSnails?.length,
      data: SlowSnails,
      totalCapitalStuck: totalCapitalStuck,
    });
  } catch (error) {
    console.log(error);
    return res.json({ error: error.response });
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
  const { dealer_id } = req.body;

  try {
    const uploadData = await pool.query(
      `SELECT upload_id,uploaded_at FROM uploads WHERE dealership_id = $1 ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id]
    );
    const upload_id = uploadData.rows?.[0]?.upload_id;

    const response = await pool.query(
      `Select stock_data from main_inventory WHERE upload_id = $1`,
      [upload_id]
    );
    const stock_data = response?.rows?.map((item) => item.stock_data);
    return res.json({ msg: stock_data });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function BBNDInventoryList(req, res) {
  const { dealer_id } = req.body;
  try {
    const bbnduploadData = await pool.query(
      `SELECT bbnd_upload_id,uploaded_at FROM bbnd_uploads WHERE dealership_id = $1 ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id]
    );
    const bbnd_upload_id = bbnduploadData.rows?.[0]?.bbnd_upload_id;

    const response = await pool.query(
      `Select stock_data from bbnd_inventory WHERE bbnd_upload_id = $1`,
      [bbnd_upload_id]
    );
    const stock_data = response?.rows?.map((item) => item.stock_data);
    return res.json({ msg: stock_data });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function GetBBNDInventoryStockUnits(req, res) {
  const { dealer_id, dealer_code } = req.body;

  try {
    const bbnduploadData = await pool.query(
      `SELECT bbnd_upload_id,uploaded_at FROM bbnd_uploads WHERE dealership_id = $1 ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id]
    );
    const bbnd_upload_id = bbnduploadData.rows?.[0]?.bbnd_upload_id;

    const response = await pool.query(
      `Select stock_data from bbnd_inventory WHERE bbnd_upload_id = $1 AND dealer_code = $2`,
      [bbnd_upload_id, dealer_code]
    );
    const stock_data = response?.rows?.map((item) => item.stock_data);
    return res.json({ units: stock_data?.length });
  } catch (error) {
    return res.json({ msg: `${error}` });
  }
}

async function BBNDInventoryListOrderDealer(req, res) {
  const { dealer_id, dealer_code } = req.body;

  try {
    const bbnduploadData = await pool.query(
      `SELECT bbnd_upload_id,uploaded_at FROM bbnd_uploads WHERE dealership_id = $1  ORDER BY uploaded_at DESC LIMIT 1`,
      [dealer_id]
    );
    const bbnd_upload_id = bbnduploadData.rows?.[0]?.bbnd_upload_id;

    const response = await pool.query(
      `Select stock_data from bbnd_inventory WHERE bbnd_upload_id = $1 AND dealer_code = $2`,
      [bbnd_upload_id, dealer_code]
    );

    const stock_data = response?.rows?.map((item) => item.stock_data);
    return res.json({ msg: stock_data });
  } catch (error) {
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
};
