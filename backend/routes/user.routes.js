const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.get('/me', userController.getMe.bind(userController));

module.exports = router;
