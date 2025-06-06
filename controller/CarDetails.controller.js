const pool = require('../connection');

function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in kilometers

    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a = Math.sin(dLat / 2) ** 2 +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance; // in kilometers
}


async function GetOffers (req,res) {
    const {car_id,variant_id,lat,lon,brand} = req.body
    let dealership_details;
    let table_names=[];

    try {
        const response = await pool.query(`SELECT * FROM onboarded_dealers WHERE  dealership_brand=$1`,[brand])
        dealership_details = response.rows;
        


        for(let item of dealership_details){
            const distance = haversine(item.lat, item.lon, parseFloat(lat), parseFloat(lon));
            

            if(distance<=25){
                table_names.push(item.dealership_name)
            }
        }

    } catch (error) {
        return res.json({error:error.response})
        
    }

    const allowedTable = ["mahindra_natraj_mobiles_pvt_ltd","natraj_hyundai","jai_pitambra_kia","jmk_toyota_jhansi","tata_jmk_jhansi","velocity_cars_jhansi","renault_jhansi","suri_automobiles_jhansi","socmo_motor_showroom","jayanti_kia","frontier_kia_showroom","allied_kia_delhi_karolbagh_showroom","ritu_kia_motinagar","kia_dealership_jhansi"]

    const results = {}

    for(let table of table_names) {
        if(!allowedTable.includes(table)) continue
               
        try {
             const result = await pool.query(`SELECT * FROM ${table} WHERE car_id=$1 AND variant_id=$2`,[car_id,variant_id]);
                results[table] = result.rows
        } catch (error) {
            results[table] = { error: `Error querying ${table}: ${error.message}` };
        }
    }

    return res.json({results});
}

module.exports = {GetOffers}