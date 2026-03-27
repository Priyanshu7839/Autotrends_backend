const express = require('express')
const { generateInventoryPDF, downloadInventoryPdf } = require('../controller/PDF.controller')
const { emailInventoryReport } = require('../Service/nodemailer')
const router = express.Router()

router.post('/generate',generateInventoryPDF)
router.post('/download',downloadInventoryPdf)
router.post('/email',emailInventoryReport)

module.exports = router