const express = require('express');
const fileController = require('../controllers/file.controller');
const asyncRequestHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/:fileId', asyncRequestHandler(fileController.getFile.bind(fileController)));

module.exports = router;
