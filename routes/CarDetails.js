const express = require('express');
const router = express.Router()
const pool = require('../connection');
const {GetOffers} = require('../controller/CarDetails.controller')


router.post('/',GetOffers)



module.exports = router