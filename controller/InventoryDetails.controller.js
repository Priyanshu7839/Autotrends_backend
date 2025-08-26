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
          const totalCapitalStuck = response?.rows?.reduce((acc,items)=>{
            const basicPrice = items["Basic Price"]
            return acc+basicPrice
        },0)
        
        return res.json({msg:'Data Fetched',FastStarsCount:FastStars?.length,data:FastStars,totalCapitalStuck:totalCapitalStuck})
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

        const totalCapitalStuck = response?.rows?.reduce((acc,items)=>{
            const basicPrice = items["Basic Price"]
            return acc+basicPrice
        },0)
        
        return res.json({msg:'Data Fetched',SlowSnailsCount:SlowSnails?.length,data:SlowSnails,totalCapitalStuck:totalCapitalStuck})
    } catch (error) {
        console.log(error)
        return res.json({error:error.response})
    }
}






async function GetDealerCodes(req,res){
    const {dealership_id} = req.body;

    try {
        const response = await pool.query(`SELECT dealer_code from dealer_codes where dealership_id = $1`,[dealership_id]);
        return res.json({msg:response.rows})
    } catch (error) {
          console.log(error)
        return res.json({error:error.response})

    }
}





module.exports = {FetchTotalInventoryUnits,FastStars,SlowSnails,GetDealerCodes}