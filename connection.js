const {Pool} = require('pg');

const pool = new Pool({
  user: 'admin22',
  host: 'meedgodb.postgres.database.azure.com',
  database: 'autotrends_dealer',
  password: 'Twitter*222023',
  port: 5432,
  ssl: {
    rejectUnauthorized: false // required for Azure Postgres
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000
})

pool.query('SELECT NOW()',(err,res)=>{
if(err){
   console.error('Error executing query', err.stack);
}
else{
     console.log('Database connected:', res.rows);
}
})

module.exports = pool