const pool = require('../connection')
const {setUser} = require('../Service/auth');

async function loginUser (req,res) {
        const {number,uid} = req.body;
            try {
                const result = await pool.query(`SELECT * FROM userDetails WHERE phone_number=$1 AND user_uid=$2`,[number,uid]);
                if(result.rows.length === 1){
                  const token = setUser(result.rows[0])
                   res.cookie('token',token)
                  return res.status(200).json({"msg":"Logged IN","user":result.rows[0]});
                }
                else{
                  return res.status(404).json({"msg":"User not found"});
                }
            } catch (error) {
                return res.status(501).json({"error":error.response})
            }

}

async function SignupDealer (req,res) {
  const {email,password} = req.body;

  try {
                const result = await pool.query(`SELECT * FROM dealership_users WHERE email=$1`,[email]);

                if(result.rows.length === 0){
                  return res.json({msg:'Dealer Email Not Found'})
                }
                
                const response = await pool.query(`Select * from dealership_users where email = $1 AND password = $2`,[email,password])
                if(response.rows.length === 0){
                    return res.json({"msg":'Wrong Password'})
                }

                const user_name = response.rows?.[0]?.["Name"]
                const dealership_user_id = response.rows?.[0]?.["dealership_users_id"];
                const dealership_user_role = response.rows?.[0]?.["role"]

               

                const assignedDealerships= await pool.query(`SELECT * FROM dealership_assignments where dealership_users_id = $1`,[dealership_user_id])
          
              

               
                  const dealership_id = assignedDealerships.rows?.[0]["dealership_id"]
                  const token = setUser(result.rows[0])
                  res.cookie('token',token)
                  const dealership  = await pool.query(`SELECT * FROM onboarded_dealers where pk_id = $1`,[dealership_id])
                  return res.status(200).json({'msg':'Logged IN',"user":dealership.rows[0],"role":dealership_user_role,"name":user_name,"user_id":dealership_user_id})
                
                

                
            } catch (error) {
                return res.status(501).json({"error":error.response})
            }

}


async function SignupUser (req,res) {
    const {name,number,uid} = req.body;
         try {
                const result = await pool.query(`SELECT * FROM userDetails WHERE phone_number=$1 AND user_uid=$2`,[number,uid]);
                if(result.rows.length === 1){
                  return res.status(200).json({"msg":"User Already exist","user":result.rows[0]});
                }
                else{
                  const result = await pool.query(`INSERT INTO userDetails (user_name,user_uid,phone_number) VALUES ($1,$2,$3) RETURNING *`,[name,uid,number])
                  const token = setUser(result.rows[0]);
                  res.cookie('token',token);
                  return res.status(200).json({"msg":"User Created","user":result.rows[0]})
                }
            } catch (error) {
                return res.status(501).json({"error":error.response})
            }
}



async function GetOwnedDealership (req,res) {
  const {userID} = req.body;
  
  try {
  const result = await pool.query(
  `SELECT d.pk_id AS dealership_id,
          d.dealership_name,
          d.dealership_brand
   FROM dealership_assignments da
   JOIN onboarded_dealers d 
     ON da.dealership_id = d.pk_id
   WHERE da.dealership_users_id = $1`,
  [userID]
);
    return res.json({"msg":result.rows})
  } catch (error) {
    return res.status(501).json({"error":error.response})
  }
}

async function GetDealershipDetails (req,res) {
  const {dealership_id} = req.body;
 
  try {
    const response = await pool.query(`SELECT * FROM onboarded_dealers WHERE pk_id = $1`,[dealership_id])
    return res.json({"msg":response.rows?.[0]});
  } catch (error) {
     return res.status(501).json({"error":error.response})
  }
}


module.exports = {loginUser,SignupUser,SignupDealer,GetOwnedDealership,GetDealershipDetails}