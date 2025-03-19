const {parseString} = require('shared-utils/env.utils');
const {deepFreeze} = require('shared-utils/obj.utils');
require('dotenv').config();

const b2StorageConfig = {
    applicationKeyId: parseString(process.env.B2_APPLICATION_KEY_ID),
    applicationKey: parseString(process.env.B2_APPLICATION_KEY),
    bucketId: parseString(process.env.B2_BUCKET_ID),
    bucketName: parseString(process.env.B2_BUCKET_NAME),
    bucketRegion: parseString(process.env.B2_BUCKET_REGION)
};

/**
 * @type {B2StorageConfig}
 */
module.exports = deepFreeze(b2StorageConfig);
