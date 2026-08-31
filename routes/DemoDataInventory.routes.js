const express = require('express')
const { GetLastUpdateDate, GetAllStocks, GetTotalCars, GetUniqueModels, GetUniqueVariants, GetAvailability, GetAgeBuckets, GetAges } = require('../controller/DemoDataInventory.controller')
const router = express.Router()


router.get('/GetLastUpdateDate/:dealer_id',GetLastUpdateDate)
router.get('/GetAllStock/:dealer_id/:Model/:Variants/:availability',GetAllStocks)
router.get('/GettotalCars/:dealer_id/:Model/:Variants/:availability',GetTotalCars)
router.get('/GetUniqueModels/:dealer_id/:availability',GetUniqueModels)
router.get('/GetUniqueVariants/:dealer_id/:Model/:availability',GetUniqueVariants)
router.get('/GetAgeBuckets/:dealer_id/:Model/:Variants/:availability',GetAgeBuckets)
router.get('/GetAges/:dealer_id/:Model/:Variants/:availability',GetAges)
router.get('/GetAvailability/:dealer_id/:Model/:Variants',GetAvailability)














module.exports = router
