const express = require('express');
const router = express.Router();

const {DownloadInventory} =  require('../controller/ExcelDownload.controller');

router.get('/DownloadInventory/:dealer_id',DownloadInventory)




module.exports = router
