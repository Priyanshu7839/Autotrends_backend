const pool = require("../connection");

function toRadians(degrees) {
  return degrees * (Math.PI / 180);
}

function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth radius in kilometers

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance; // in kilometers
}

async function GetOffers(req, res) {
  const { car_id, variant_id, lat, lon, brand } = req.body;
  console.log(car_id, variant_id, lat, lon, brand )
  let dealership_details;
  let nearbyDealers = [];

  try {
    const response = await pool.query(
      `SELECT * FROM onboarded_dealers WHERE  dealership_brand=$1`,
      [brand]
    );
    dealership_details = response.rows;

    for (let item of dealership_details) {
      const distance = haversine(
        item.lat,
        item.lon,
        parseFloat(lat),
        parseFloat(lon)
      );

      if (distance <= 25) {
        nearbyDealers.push({ id: item.pk_id, name: item.dealership_name });
      }
    }
  } catch (error) {
    return res.json({ error: error.response });
  }

  const results = {};

  for (let dealer of nearbyDealers) {

    try {
      const result = await pool.query(
        `SELECT * FROM inventory WHERE car_id=$1 AND variant_id=$2 AND dealer_id=$3`,
        [car_id, variant_id,dealer.id]
      );
      console.log(result.rows)
      results[dealer.id] = {
        name: dealer.name,
        data: result.rows,
      };
    } catch (error) {
      results[dealer.id] = {
        name: dealer.name,
        error: `Error querying ${dealer.name}: ${error.message}`,
      };
    }
  }

  return res.json({ results });
}



async function CarQuotation(req,res){
    try {
        const response = await pool.query(
            `SELECT q.*,
            m."modelName",
            m."modelImage",
            v."name",
            v."exShowRoomPrice",
            u.user_name,
            u.phone_number,
            u.pancard

            FROM car_quotations q
            JOIN "public"."ACKODTO" m ON q.car_id = m."modelId"
            JOIN "public"."VARIANTS_SPLITTED" v ON q.variant_id = v."centralId"
            JOIN userDetails u ON q.user_uid = u.user_uid
           
            `
        )

    return res.json({ msg: response.rows });
    
    } catch (error) {
    return res.json({ msg: `${error}` });
        
    }
}


async function SpecificQuotation(req,res){
  try{
    const response = await pool.query(
      `SELECT s.*,
        i.*,
        u.user_name,
        u.phone_number,
        u.pancard

        FROM dealer_specific_quotations s
        JOIN inventory i ON s.inventory_id = i.inventory_id
        JOIN userDetails u ON s.user_uid = u.user_uid
      `
    )

     return res.json({ msg: response.rows });
  }
  catch{
    return res.json({ msg: `${error}` });
  }
}

async function AverageSalesFetch(req,res){
    const {dealer_id} = req.body;

    try {
        const response = await pool.query(`SELECT "Average Sales" from onboarded_dealers WHERE pk_id =$1`,[dealer_id]);
        return res.json({"msg":"Data fetched","Data":response.rows})
    } catch (error) {
        console.log(error);
        return res.json({"error":`${error}`});
    }
}



module.exports = { GetOffers,CarQuotation,SpecificQuotation,AverageSalesFetch};
