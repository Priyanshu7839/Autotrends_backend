const express = require('express');
const router = express.Router();
const {UploadInventory}  = require('../controller/ExcelUploads.controller');
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

router.post('/uploadInventory',upload.single("file"), UploadInventory)


module.exports = router