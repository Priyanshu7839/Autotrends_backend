const express = require('express');
const router = express.Router();
const {loginUser,SignupUser, SignupDealer} = require('../controller/UserAuth.controller')

router.post('/login',loginUser);
router.post('/signup',SignupUser)
router.post('/dealer/signup',SignupDealer)

module.exports = router