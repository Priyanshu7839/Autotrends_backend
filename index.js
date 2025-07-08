const express = require('express');
const carDetailsRoute = require('./routes/CarDetails');
const userAuthRoute = require('./routes/userAuth.routes');
const forSubmisiionRoute = require('./routes/ForSubmisiion.routes');
const cors = require('cors')


const app = express();
const PORT = 8002;
app.use(cors({
    origin:['http://localhost:5173','https://autotrends.ai','http://localhost:5174']
}))
app.use(express.json());
app.use('/deals',carDetailsRoute)
app.use('/user',userAuthRoute);
app.use('/submit',forSubmisiionRoute)




app.listen(PORT,()=>{
    console.log(`Server Started at port ${PORT}`);
})
