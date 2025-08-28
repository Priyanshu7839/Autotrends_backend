const express = require('express');
const router = express.Router();
const {GetOffers, CarQuotation,SpecificQuotation, AverageSalesFetch} = require('../controller/CarDetails.controller');


router.post('/',GetOffers);
router.get('/Quotations',CarQuotation);
router.get('/SpecificQuotation',SpecificQuotation);
router.post('/GetAverageSales',AverageSalesFetch);



module.exports = router;