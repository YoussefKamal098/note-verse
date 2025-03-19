const express = require('express');
const fileController = require('../controllers/file.controller');
const asyncRequestHandler = require('../utils/asyncHandler');
const verifyAuthUserOwnershipMiddleware = require("../middlewares/verifyAuthUserOwnership.middleware");

const router = express.Router({mergeParams: true});

router.get('/:fileId',
    asyncRequestHandler(verifyAuthUserOwnershipMiddleware),
    asyncRequestHandler(fileController.getFile.bind(fileController))
);

module.exports = router;
