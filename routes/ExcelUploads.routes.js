const express = require('express');
const router = express.Router();
const {UploadInventory, UploadBBNDInventory, UploadPoolStock, uploadVNAExcel,getVnaComputedData, UploadDealerDemoData, importManyChatContact}  = require('../controller/ExcelUploads.controller');
const multer = require('multer')
const path = require('path')

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

router.post('/uploadInventory',upload.single("file"), UploadInventory)
router.post('/uploadBBNDInventory',upload.single("file"), UploadBBNDInventory)
router.post('/uploadPoolStock',upload.single("file"), UploadPoolStock)
router.post('/uploadVNA',upload.single("file"), uploadVNAExcel)
router.post('/uploadDemoData',upload.single("file"), UploadDealerDemoData)
router.post(
  "/manychat/import",
  importManyChatContact
);


module.exports = router