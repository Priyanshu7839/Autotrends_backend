const express = require('express')
const { GetTotalCars, GetUniqueModels, GetUniqueVariants, GetAgeBuckets,GetLastUpdateDate,GetAges, GetAllStocks,GetAllDeletedStocks, GetStockStatusHeader } = require('../controller/BBNDInventoryData.controller')
const router = express.Router()

router.get('/GettotalCars/:dealer_id/:order_dealer',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id/:order_dealer',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:order_dealer',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:order_dealer',GetAgeBuckets)
router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAges/:dealer_id/:order_dealer',GetAges)
router.get('/GetAllStock/:dealer_id/:order_dealer',GetAllStocks)
router.get('/GetAllDeletedStock/:dealer_id/:order_dealer',GetAllDeletedStocks)
router.get('/GetStockStatusHeader/:dealer_id/:order_dealer',GetStockStatusHeader)


module.exports = router