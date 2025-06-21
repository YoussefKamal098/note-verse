const express = require('express');
const {makeClassInvoker} = require("awilix-express");
const asyncRequestHandler = require('../utils/asyncHandler');
const FileController = require("../controllers/file.controller");

const router = express.Router();
const api = makeClassInvoker(FileController);

router.get('/:fileId', asyncRequestHandler(api('getFile')));

module.exports = router;
