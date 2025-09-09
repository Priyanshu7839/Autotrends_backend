const express = require('express');
const router = express.Router();
const {CarQuotationForm,SubmitPan,UpdateInventory,SpecificQuotation,UploadXL, AverageSalesUpload, BBNDUploadXLCompare, UploadBBNDXL, UploadSalesXL} = require('../controller/FormSubmission.controller')
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

router.post('/carQuotation',CarQuotationForm);
router.post('/pan',SubmitPan);
router.post('/updateInventory',UpdateInventory);
router.post('/SpecificQuotation',SpecificQuotation);
router.post("/uploadxl", upload.single("file"), UploadXL);
router.post("/uploadaveragesales",AverageSalesUpload);
router.post("/uploadbbndxlcompare",upload.single("file"),BBNDUploadXLCompare);
router.post("/uploadbbndxl",upload.single("file"),UploadBBNDXL);
router.post("/uploadsalesxl",upload.single("file"),UploadSalesXL);



module.exports = router