const express = require('express');
const router = express.Router();

const {DownloadInventory, DownloadBBNDInventory} =  require('../controller/ExcelDownload.controller');

router.get('/DownloadInventory/:dealer_id',DownloadInventory)
router.get('/DownloadBBNDInventory/:dealer_id',DownloadBBNDInventory)




module.exports = router
