const express = require('express');
const {makeClassInvoker} = require('awilix-express');
const asyncRequestHandler = require('../utils/asyncHandler');
const container = require('../container');
const {validateVersionAccessPermission} = require('../middlewares/version.permissionValidation.middleware');
const VersionController = require('../controllers/version.controller');

const router = express.Router({mergeParams: true});
const validateVersionAccessPermissionMiddleware = container.build(validateVersionAccessPermission);
const api = makeClassInvoker(VersionController);


// Get version metadata
router.get(
    '/:versionId',
    asyncRequestHandler(validateVersionAccessPermissionMiddleware),
    asyncRequestHandler(api('getVersion'))
);

// Get version content
router.get(
    '/:versionId/content',
    asyncRequestHandler(validateVersionAccessPermissionMiddleware),
    asyncRequestHandler(api('getVersionContent'))
);

// Restore to a version
router.post(
    '/:versionId/restore',
    asyncRequestHandler(api('restoreVersion'))
);

module.exports = router;
