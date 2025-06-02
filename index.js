const express = require('express');
const carDetailsRoute = require('./routes/CarDetails');
const userAuthRoute = require('./routes/userAuth.routes');
const cors = require('cors')


const app = express();
const PORT = 8002;
app.use(cors({
    origin:['http://localhost:5173','https://autotrends.ai']
}))
app.use(express.json());
app.use('/deals',carDetailsRoute)
app.use('/user',userAuthRoute)




app.listen(PORT,()=>{
    console.log(`Server Started at port ${PORT}`);
})
