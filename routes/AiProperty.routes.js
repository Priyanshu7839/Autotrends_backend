const express = require('express');
const router = express.Router();
const {GeneratePDF} = require('../controller/AiPropertyReport')


router.get('/getpdf',GeneratePDF)

module.exports = router;