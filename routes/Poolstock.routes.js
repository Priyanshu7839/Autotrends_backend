const express = require('express')
const {getVnaComputedData, GetLastUpdateDateVNA, GetLastUpdateDatepoolstock, getUniqueCodes, GetPoolStock, GetOriginalVna, getModels, getVariants, getDealerships, getColour, getPoolstockModels, getpoolstockVariants, getpoolstockColour} = require('../controller/Poolstock.controller')
const router = express.Router()


router.post('/getComputedVna',getVnaComputedData)
router.get('/GetLastUpdateDateVNA/:dealer_id',GetLastUpdateDateVNA)
router.get('/GetLastUpdateDatepoolstock/:dealer_id',GetLastUpdateDatepoolstock)
router.get('/getuniquecodes',getUniqueCodes)
router.get('/getpoolstock/:Model/:Variant/:Color',GetPoolStock)
router.post('/getvna/:Model/:Variant/:Color',GetOriginalVna)
router.post('/getModels/:Model/:Variant/:Color',getModels)
router.post('/getVariants/:Model/:Variant/:Color',getVariants)
router.get('/getDealerships/',getDealerships)
router.post('/getColour/:Model/:Variant/:Color',getColour)
router.get('/getpoolstockmodels/:Model/:Variant/:Color',getPoolstockModels)
router.get('/getpoolstockvariants/:Model/:Variant/:Color',getpoolstockVariants)
router.get('/getpoolstockcolours/:Model/:Variant/:Color',getpoolstockColour)




module.exports = router