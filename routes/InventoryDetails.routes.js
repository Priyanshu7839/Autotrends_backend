const express = require('express');
const router = express.Router();
const { FetchTotalInventoryUnits, FastStars, SlowSnails, GetDealerCodes, InventoryList, BBNDInventoryList, BBNDInventoryListOrderDealer, GetBBNDInventoryStockUnits, InventoryListOrderDealer, FetchFestiveSales, CustomerSalesHeader, FetchCustomerSales, MasterInventoryList, MasterInventoryListOrderDealer } = require('../controller/InventoryDetails.controller');



router.post('/InventoryUnits',FetchTotalInventoryUnits)
router.post('/FastStars',FastStars)
router.post('/SlowSnails',SlowSnails)
router.post('/getdealercodes',GetDealerCodes)
router.post('/InventoryList',InventoryList);
router.post('/InventoryListOrderDealer',InventoryListOrderDealer);
router.post('/BBNDInventoryList',BBNDInventoryList)
router.post('/BBNDInventoryListOrderDealer',BBNDInventoryListOrderDealer)
router.post('/getbbndstockunits',GetBBNDInventoryStockUnits)
router.post('/fetchfestivesales',FetchFestiveSales);
router.post('/fetchsalesheader',CustomerSalesHeader);
router.post('/fetchcustomersales',FetchCustomerSales);
router.post('/MasterInventoryList',MasterInventoryList)
router.post('/MasterInventoryListOrderDealer',MasterInventoryListOrderDealer)

module.exports = router
