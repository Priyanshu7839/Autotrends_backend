const express = require('express')
const { GetTotalCars, CapitalStuck, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetLastUpdateDate,GetAges, GetAllStocks, GetStockStatusHeader, FastStars, SlowSnails, MfgDate } = require('../controller/InventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetTotalCars)
router.get('/CapitalStuck/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',CapitalStuck)
router.get('/GetUniqueModels/:dealer_id/:order_dealer/:stock_status/:Year',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer/:stock_status/:Model/:Year',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAgeBuckets)
router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAges)
router.get('/GetAllStock/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAllStocks)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer/:Model/:Variants/:Year',GetStockStatusHeader)
router.get('/fastStars/:dealer_id/:order_dealer',FastStars)
router.get('/slowSnails/:dealer_id/:order_dealer',SlowSnails)
router.get('/mfgdate/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',MfgDate)




module.exports = router