const {time, timeUnit} = require("shared-utils/date.utils");
const httpCodes = require("../constants/httpCodes");
const httpHeaders = require("../constants/httpHeaders");
const fileStorageService = require("../services/fileStorage.service");
const CacheControlBuilder = require("../utils/cacheControlBuilder");

class FileController {
    /**
     * @private
     * @type {FileStorageService}
     * @description The file storage service instance.
     */
    #fileStorageService;

    /**
     * Constructs a new FileController.
     *
     * @param {FileStorageService} fileStorageService - The file storage service instance.
     */
    constructor(fileStorageService) {
        this.#fileStorageService = fileStorageService;
    }

    /**
     * Retrieves a file and streams it to the client.
     *
     * Sets appropriate cache headers and content headers based on metadata.
     *
     * @param {import('express').Request} req - The Express request object.
     * @param {import('express').Response} res - The Express response object.
     * @returns {Promise<void>} A promise that resolves when the file is streamed.
     */
    async getFile(req, res) {
        const {fileId, userId} = req.params;

        const {stream, metadata} = await this.#fileStorageService.download(fileId, userId);


        const etag = `"${metadata.hash}"`;
        const cacheControl = new CacheControlBuilder()
            .setPrivate(true)
            .setImmutable(true)
            .setNoTransform(true)
            .setMaxAge(time({[timeUnit.DAY]: 1}))
            .build();

        if (req.headers[httpHeaders.IF_NONE_MATCH] === etag) {
            res.status(httpCodes.NOT_MODIFIED.code).end({message: httpCodes.NOT_MODIFIED.message});
            return;
        }

        res.setHeader(httpHeaders.CACHE_CONTROL, cacheControl);
        res.setHeader(httpHeaders.ETAG, etag);
        res.setHeader(httpHeaders.LAST_MODIFIED, metadata.lastModified.toUTCString());
        res.setHeader(httpHeaders.CONTENT_DISPOSITION, `attachment; filename=${fileId}.${metadata.ext}`);
        res.setHeader(httpHeaders.CONTENT_TYPE, metadata.mimetype ? metadata.mimetype : 'application/octet-stream');

        stream.pipe(res);
    }
}

module.exports = new FileController(fileStorageService);
