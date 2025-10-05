const express = require('express');
const router = express.Router();
const {CarQuotationForm,SubmitPan,UpdateInventory,SpecificQuotation,UploadXL, AverageSalesUpload, BBNDUploadXLCompare, UploadBBNDXL, UploadSalesXL, UploadLeadsXL} = require('../controller/FormSubmission.controller')
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

const upload = multer({ storage,
  limits: {
    fieldSize: 25 * 1024 * 1024, // allows text fields up to 25MB
    fileSize: 50 * 1024 * 1024,  // allows file uploads up to 50MB
  },
 });

router.post('/carQuotation',CarQuotationForm);
router.post('/pan',SubmitPan);
router.post('/updateInventory',UpdateInventory);
router.post('/SpecificQuotation',SpecificQuotation);
router.post("/uploadxl", upload.single("file"), UploadXL);
router.post("/uploadaveragesales",AverageSalesUpload);
router.post("/uploadbbndxlcompare",upload.single("file"),BBNDUploadXLCompare);
router.post("/uploadbbndxl",upload.single("file"),UploadBBNDXL);
router.post("/uploadsalesxl",upload.single("file"),UploadSalesXL);
router.post("/uploadleadsxl",upload.single("file"),UploadLeadsXL);



module.exports = router