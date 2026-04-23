const express = require('express')
const { GetTotalCars, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetAges, GetStockStatusHeader } = require('../controller/MasterInventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id/:order_dealer/:stock_status/:Year',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer/:stock_status/:Model/:Year',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAgeBuckets)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAges)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer/:Model/:Variants/:Year',GetStockStatusHeader)

module.exports = router