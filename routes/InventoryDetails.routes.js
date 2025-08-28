const express = require('express');
const router = express.Router();
const { FetchTotalInventoryUnits, FastStars, SlowSnails, GetDealerCodes, InventoryList, BBNDInventoryList, BBNDInventoryListOrderDealer } = require('../controller/InventoryDetails.controller');



router.post('/InventoryUnits',FetchTotalInventoryUnits)
router.post('/FastStars',FastStars)
router.post('/SlowSnails',SlowSnails)
router.post('/getdealercodes',GetDealerCodes)
router.post('/InventoryList',InventoryList);
router.post('/BBNDInventoryList',BBNDInventoryList)
router.post('/BBNDInventoryListOrderDealer',BBNDInventoryListOrderDealer)

module.exports = router
