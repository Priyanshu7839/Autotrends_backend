const express = require('express');
const router = express.Router();
const {CarQuotationForm,SubmitPan,UpdateInventory,SpecificQuotation} = require('../controller/FormSubmission.controller')

router.post('/carQuotation',CarQuotationForm);
router.post('/pan',SubmitPan);
router.post('/updateInventory',UpdateInventory);
router.post('/SpecificQuotation',SpecificQuotation);


module.exports = router