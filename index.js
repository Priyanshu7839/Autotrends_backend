require("dotenv").config();


const express = require('express');
const carDetailsRoute = require('./routes/CarDetails.routes');
const userAuthRoute = require('./routes/userAuth.routes');
const forSubmisiionRoute = require('./routes/ForSubmisiion.routes');
const InventoryDetails = require('./routes/InventoryDetails.routes')
const cors = require('cors')
const pdfRoute = require('./routes/AiProperty.routes')

const app = express();
const PORT = 8002;
app.use(cors({
    origin:['http://localhost:5173','https://autotrends.ai','http://localhost:5174','http://localhost:3000'],
     credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}))

app.use(express.json());
app.use('/deals',carDetailsRoute)
app.use('/user',userAuthRoute);
app.use('/submit',forSubmisiionRoute)
app.use('/Dashboard',InventoryDetails)
app.use('/aiproperty',pdfRoute)



app.listen(PORT,()=>{
    console.log(`Server Started at port ${PORT}`);
})
