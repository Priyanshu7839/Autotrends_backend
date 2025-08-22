const express = require('express');
const router = express.Router();
const { FetchTotalInventoryUnits, FastStars, SlowSnails } = require('../controller/InventoryDetails.controller');


router.post('/InventoryUnits',FetchTotalInventoryUnits)
router.post('/FastStars',FastStars)
router.post('/SlowSnails',SlowSnails)

module.exports = router
