const express = require('express')
const { GetTotalCars, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetAges, GetStockStatusHeader } = require('../controller/MasterInventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id/:order_dealer/:stock_status',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer/:stock_status/:Model',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAgeBuckets)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAges)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer/:Model/:Variants',GetStockStatusHeader)

module.exports = router