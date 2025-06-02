const express = require('express');
const router = express.Router();
const {loginUser,SignupUser} = require('../controller/UserAuth.controller')

router.post('/login',loginUser);
router.post('/signup',SignupUser)

module.exports = router