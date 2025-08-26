const express = require('express');
const router = express.Router();
const { FetchTotalInventoryUnits, FastStars, SlowSnails, GetDealerCodes } = require('../controller/InventoryDetails.controller');


router.post('/InventoryUnits',FetchTotalInventoryUnits)
router.post('/FastStars',FastStars)
router.post('/SlowSnails',SlowSnails)
router.post('/getdealercodes',GetDealerCodes)

module.exports = router
