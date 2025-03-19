/**
 * @typedef {Object} UploadedFile
 * @property {string} fieldname - Form field name used for upload
 * @property {string} originalname - Original file name with extension
 * @property {string} encoding - File encoding type
 * @property {string} mimetype - Detected MIME type
 * @property {string} name - File name without extension
 * @property {string} fileId - Unique identifier for stored file
 * @property {string} ext - File extension (without a dot)
 * @property {number} size - File size in bytes
 * @property {string} owner - User ID of the file owner from route params
 */

/**
 * @typedef {import('express').Request} ExpressRequest
 * @typedef {ExpressRequest & { files: UploadedFile[] }} FileUploadRequest
 */
