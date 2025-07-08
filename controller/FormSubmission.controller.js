const pool = require('../connection')

async function CarQuotationForm (req,res) {
const {uid,lat,lon,city,price,dealership,color,car_id,variant_id,hexCode} = req.body;

if(!uid||!lat||!lon||!city||!price||!dealership||!color||!car_id||!variant_id){
    return res.json({"msg":"Fill all the Data"});
}

try {
    const response = await pool.query(`INSERT INTO car_quotations (user_uid,lat,lon,city,price,offering_dealership,color,car_id,variant_id,color_code) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,[uid,lat,lon,city,price,dealership,color,car_id,variant_id,hexCode]);

    return res.json({msg:"Quotation Submitted"});
} catch (error) {
    return res.json({msg:`${error}`});
}


}



async function SubmitPan (req,res) {
    const {pan,uid} = req.body;
    console.log(pan,uid)
    if(!pan||!uid){
        return res.json({msg:"PLease Submit Pan Number or UID"});
    }

    try {
        const response = await pool.query(`UPDATE userDetails SET pancard=$1 WHERE user_uid=$2 `,[pan,uid])

        return res.json({msg:'pan Submitted'})
    } catch (error) {
        return res.json({msg:`${error}`})
    }

}


async function UpdateInventory (req,res) {
    const {dealer_id,car_id,variant_id,year,color,color_code,stock,accessories,tcs,insurance,agent,fasttag,warranty,miscellaneous,rto,delivery,qty,bid} = req.body;
    try {
        const response = await pool.query(`INSERT INTO inventory (dealer_id,car_id,variant_id,model_year,model_color,color_code,stock_number,qty,accessories_charges,tcs_charges,insurance_charges,insurance_agent,fasttag_charges,extended_warranty_charges,rto_price,miscellaneous_charges,expected_delivery,autotrends_bid_price) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)`,[dealer_id,car_id,variant_id,year,color,color_code,stock,qty,accessories,tcs,insurance,agent,fasttag,warranty,rto,miscellaneous,delivery,bid])

        return res.json(({msg:'Inventory Updated'}))
    } catch (error) {
        return res.json({msg:`${error}`})
        
    }
}


async function SpecificQuotation (req,res) {
    const {user_uid,inventory_id,lat,lon,city} = req.body;

    try {
        const response = await pool.query(`INSERT INTO dealer_specific_quotations (user_uid,inventory_id,lat,lon,city) VALUES ($1,$2,$3,$4,$5)`,[user_uid,inventory_id,lat,lon,city]);

        return res.json({msg:'Quotation Updated'});
    } catch (error) {
        return res.json({msg:`${error}`})
        
    }


}

module.exports = {CarQuotationForm,SubmitPan,UpdateInventory,SpecificQuotation}