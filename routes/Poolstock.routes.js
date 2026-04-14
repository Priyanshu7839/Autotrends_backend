const express = require('express')
const {getVnaComputedData, GetLastUpdateDateVNA, GetLastUpdateDatepoolstock, getUniqueCodes} = require('../controller/Poolstock.controller')
const router = express.Router()


router.post('/getComputedVna',getVnaComputedData)
router.get('/GetLastUpdateDateVNA/:dealer_id',GetLastUpdateDateVNA)
router.get('/GetLastUpdateDatepoolstock/:dealer_id',GetLastUpdateDatepoolstock)
router.get('/getuniquecodes',getUniqueCodes)


module.exports = router