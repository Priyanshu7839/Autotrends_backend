const express = require('express')
const { GetTotalCars, CapitalStuck, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetLastUpdateDate,GetAges, GetAllStocks, GetStockStatusHeader, FastStars, SlowSnails } = require('../controller/InventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetTotalCars)
router.get('/CapitalStuck/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',CapitalStuck)
router.get('/GetUniqueModels/:dealer_id/:order_dealer/:stock_status',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer/:stock_status/:Model',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAgeBuckets)
router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAges)
router.get('/GetAllStock/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAllStocks)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer/:Model/:Variants',GetStockStatusHeader)
router.get('/fastStars/:dealer_id/:order_dealer',FastStars)
router.get('/slowSnails/:dealer_id/:order_dealer',SlowSnails)



module.exports = router