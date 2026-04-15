const express = require('express')
const {getVnaComputedData, GetLastUpdateDateVNA, GetLastUpdateDatepoolstock, getUniqueCodes, GetPoolStock, GetOriginalVna, getModels, getVariants} = require('../controller/Poolstock.controller')
const router = express.Router()


router.post('/getComputedVna',getVnaComputedData)
router.get('/GetLastUpdateDateVNA/:dealer_id',GetLastUpdateDateVNA)
router.get('/GetLastUpdateDatepoolstock/:dealer_id',GetLastUpdateDatepoolstock)
router.get('/getuniquecodes',getUniqueCodes)
router.get('/getpoolstock',GetPoolStock)
router.post('/getvna',GetOriginalVna)
router.post('/getModels',getModels)
router.post('/getVariants',getVariants)


module.exports = router