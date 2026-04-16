const express = require('express');
const router = express.Router();

const {DownloadInventory, DownloadBBNDInventory, DownloadMatchedExcel, DownloadOriginalVna, DownloadPoolstock} =  require('../controller/ExcelDownload.controller');

router.get('/DownloadInventory/:dealer_id',DownloadInventory)
router.get('/DownloadBBNDInventory/:dealer_id',DownloadBBNDInventory)
router.get('/DownloadMatchedExcel/:dealer_id/:selectedDealerCode',DownloadMatchedExcel)
router.get('/DownloadOriginalVna/:dealer_id',DownloadOriginalVna)
router.get('/DownloadPoolstock',DownloadPoolstock)





module.exports = router
