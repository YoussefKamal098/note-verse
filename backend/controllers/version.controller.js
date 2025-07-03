const AppError = require('../errors/app.error');
const httpCodes = require('../constants/httpCodes');
const statusMessages = require('../constants/statusMessages');

class VersionController {
    /**
     * @private
     * @type {VersionService}
     */
    #versionService;

    /**
     * @private
     * @type {RestoreNoteVersionUseCase}
     */
    #restoreVersionUseCase;

    /**
     * @param {Object} dependencies
     * @param {VersionService} dependencies.versionService
     * @param {RestoreNoteVersionUseCase} dependencies.restoreVersionUseCase
     */
    constructor({versionService, restoreVersionUseCase}) {
        this.#versionService = versionService;
        this.#restoreVersionUseCase = restoreVersionUseCase;
    }

    /**
     * Get version by ID
     */
    async getVersion(req, res) {
        res.status(httpCodes.OK.code).json(req.version);
    }

    /**
     * Get version content
     */
    async getVersionContent(req, res) {
        const {versionId} = req.params;

        const content = await this.#versionService.getVersionContent(versionId);
        if (!content) {
            throw new AppError(
                statusMessages.VERSION_NOT_FOUND,
                httpCodes.NOT_FOUND.code,
                httpCodes.NOT_FOUND.name
            );
        }

        res.status(httpCodes.OK.code).json({content});
    }

    /**
     * Restore to a specific version
     */
    async restoreVersion(req, res) {
        const {versionId} = req.params;
        const {userId} = req;

        const result = await this.#restoreVersionUseCase.execute({
            userId,
            versionId
        });

        req.updatedNote = result.note;
        res.status(httpCodes.OK.code).json({
            note: result.note,
            version: result.version
        });
    }
}

module.exports = VersionController;
