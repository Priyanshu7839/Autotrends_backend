const pool = require('../connection');


async function GetOffers (req,res) {
    const {car_id,variant_id,city,brand} = req.body
    let table_names;

    try {
        const response = await pool.query(`SELECT dealership_name FROM onboarded_dealers WHERE city=$1 AND dealership_brand=$2`,[city,brand])
        table_names = response.rows.map(row => row.dealership_name);
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