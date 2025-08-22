const pool = require('../connection');

async function FetchTotalInventoryUnits (req,res) {
    const {DealerCodes} = req.body;

    try {
        const response =await pool.query(`Select * from kia_inventory WHERE "Order Dealer" = ANY($1)`,[DealerCodes])

        if(response?.rows?.length>0){
            
            return res.json({Units:response.rows?.length})
        }
    } catch (error) {
        console.log(error)
        return res.json({error:error.response})
    }

    
}

async function FastStars (req,res) {
    const {DealerCodes} = req.body 

    

    try {
        const response = await pool.query(`Select * from kia_inventory WHERE "Order Dealer" = ANY($1)`,[DealerCodes])
        const FastStars = response?.rows?.filter((model)=>model["Stock Age"] <= 15)
        
        return res.json({msg:'Data Fetched',FastStarsCount:FastStars?.length,data:FastStars})
    } catch (error) {
        console.log(error)
        return res.json({error:error.response})
    }
}
async function SlowSnails (req,res) {
    const {DealerCodes} = req.body 

    

    try {
        const response = await pool.query(`Select * from kia_inventory WHERE "Order Dealer" = ANY($1)`,[DealerCodes])
        const SlowSnails = response?.rows?.filter((model)=>model["Stock Age"] >= 75)
        
        return res.json({msg:'Data Fetched',SlowSnailsCount:SlowSnails?.length,data:SlowSnails})
    } catch (error) {
        console.log(error)
        return res.json({error:error.response})
    }
}




module.exports = {FetchTotalInventoryUnits,FastStars,SlowSnails}