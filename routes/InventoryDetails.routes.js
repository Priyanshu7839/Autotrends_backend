const express = require('express');
const router = express.Router();
const { FetchTotalInventoryUnits, FastStars, SlowSnails, GetDealerCodes, InventoryList, BBNDInventoryList, BBNDInventoryListOrderDealer, GetBBNDInventoryStockUnits, InventoryListOrderDealer } = require('../controller/InventoryDetails.controller');



router.post('/InventoryUnits',FetchTotalInventoryUnits)
router.post('/FastStars',FastStars)
router.post('/SlowSnails',SlowSnails)
router.post('/getdealercodes',GetDealerCodes)
router.post('/InventoryList',InventoryList);
router.post('/InventoryListOrderDealer',InventoryListOrderDealer);
router.post('/BBNDInventoryList',BBNDInventoryList)
router.post('/BBNDInventoryListOrderDealer',BBNDInventoryListOrderDealer)
router.post('/getbbndstockunits',GetBBNDInventoryStockUnits)

module.exports = router
