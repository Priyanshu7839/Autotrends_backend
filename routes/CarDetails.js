const express = require('express');
const router = express.Router();
const {GetOffers, InventoryList, CarQuotation,SpecificQuotation, AverageSalesFetch} = require('../controller/CarDetails.controller');


router.post('/',GetOffers);
router.get('/InventoryList',InventoryList);
router.get('/Quotations',CarQuotation);
router.get('/SpecificQuotation',SpecificQuotation);
router.post('/GetAverageSales',AverageSalesFetch);



module.exports = router;