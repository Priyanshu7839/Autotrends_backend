const express = require('express')
const { GetLastUpdateDate, GetAllStocks, GetTotalCars, GetUniqueModels, GetUniqueVariants } = require('../controller/DemoDataInventory.controller')
const { GetAgeBuckets, GetAges } = require('../controller/BBNDInventoryData.controller')
const router = express.Router()


router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAllStock/:dealer_id/:Model/:Variants',GetAllStocks)
router.get('/GettotalCars/:dealer_id/:Model/:Variants',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:Model',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAgeBuckets)
router.get('/GetAges/:dealer_id/:order_dealer/:stock_status/:Model/:Variants/:Year',GetAges)














module.exports = router
