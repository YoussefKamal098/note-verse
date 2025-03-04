const express = require('express');
const csrfController = require('../controllers/csrf.controller');
const noCacheMiddleware = require('../middlewares/noCache.middleware');
const csrfTokenMiddleware = require('../middlewares/csrfToken.middleware');
const asyncRequestHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get('/',
    noCacheMiddleware,
    csrfTokenMiddleware,
    asyncRequestHandler(csrfController.getToken.bind(csrfController))
);

module.exports = router;
