const express = require('express');
const router = express.Router();
const {GetOffers, InventoryList, CarQuotation,SpecificQuotation} = require('../controller/CarDetails.controller');


router.post('/',GetOffers);
router.get('/InventoryList',InventoryList);
router.get('/Quotations',CarQuotation);
router.get('/SpecificQuotation',SpecificQuotation);



module.exports = router;