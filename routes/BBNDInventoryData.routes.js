const express = require('express')
const { GetTotalCars, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetLastUpdateDate,GetAges, GetAllStocks,GetAllDeletedStocks, GetStockStatusHeader } = require('../controller/BBNDInventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id/:order_dealer/:stock_status',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer/:stock_status/:Model',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAgeBuckets)
router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAges)
router.get('/GetAllStock/:dealer_id/:order_dealer/:stock_status/:Model/:Variants',GetAllStocks)
router.get('/GetAllDeletedStock/:dealer_id/:order_dealer',GetAllDeletedStocks)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer/:Model/:Variants',GetStockStatusHeader)


module.exports = router