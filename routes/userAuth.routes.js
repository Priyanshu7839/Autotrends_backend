const express = require('express');
const router = express.Router();
const {loginUser,SignupUser, SignupDealer,GetOwnedDealership,GetDealershipDetails} = require('../controller/UserAuth.controller');
const { sendOTP, VerifyOTP } = require('../Service/nodemailer');

router.post('/login',loginUser);
router.post('/signup',SignupUser)
router.post('/dealer/signup',SignupDealer)
router.post('/dealer/getowneddealerships',GetOwnedDealership)
router.post('/dealer/getdealershipdetails',GetDealershipDetails)
router.post('/dealer/sendotp',sendOTP)
router.post('/dealer/verifyotp',VerifyOTP)

module.exports = router