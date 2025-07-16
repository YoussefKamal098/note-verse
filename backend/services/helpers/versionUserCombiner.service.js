const BaseResourceCombiner = require('./baseResourceCombiner.service');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Combines resources with their related version documents
 * @extends BaseResourceCombiner<OutputVersion>
 */
class ResourceVersionCombiner extends BaseResourceCombiner {
    /**
     * @private
     * @type {import('@/repositories/version.repository').VersionRepository}
     */
    #versionRepo;

    /**
     * Creates a new ResourceVersionCombiner instance
     * @param {Object} dependencies
     * @param {import('@/repositories/version.repository').VersionRepository} dependencies.versionRepo
     */
    constructor({versionRepo}) {
        super();
        this.#versionRepo = versionRepo;
    }

    /**
     * Combines resources with their version documents
     *
     * @param {Array<Object>} resources - Resources to combine with versions
     * @param {Object} [options] - Configuration options
     * @param {string} [options.versionIdField='versionId'] - Field containing version reference
     * @param {Object|string} [options.projection] - Fields to include from versions
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Array<Readonly<Object>>>>} Frozen array of resources with versions attached
     *
     * @example
     * await combiner.combineWithVersions(
     *   [{id: '1', versionId: 'v1'}, {id: '2', versionId: 'v2'}],
     *   {versionIdField: 'versionId', projection: {number: 1}}
     * )
     */
    async combineWithVersions(resources, {versionIdField = 'versionId', projection = null, session = null} = {}) {
        if (!resources?.length) return deepFreeze([]);

        const versionIds = [
            ...new Set(resources.map(r => this._extractNestedId(r, versionIdField)).filter(Boolean))
        ];

        if (!versionIds.length) return deepFreeze([]);

        const versions = await this.#versionRepo.findByIds(versionIds, {projection, session});

        return this._combineAll(resources, versions, versionIdField, 'version');
    }

    /**
     * Combines a single resource with its version document
     *
     * @param {Object} resource - The resource to combine with version
     * @param {Object} [options] - Configuration options
     * @param {string} [options.versionIdField='versionId'] - Field containing version reference
     * @param {Object|string} [options.projection] - Fields to include from version
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} Frozen combined object with version
     *
     * @example
     * await combiner.combineWithSingleVersion(
     *   {id: '1', versionId: 'v1'},
     *   {versionIdField: 'versionId', projection: {number: 1}}
     * )
     */
    async combineWithSingleVersion(resource, {versionIdField = 'versionId', projection = null, session = null} = {}) {
        if (!resource) return null;

        const versionId = this._extractNestedId(resource, versionIdField);
        if (!versionId) return null;

        const version = await this.#versionRepo.getVersion(versionId, {projection, session});
        return this._combineSingle(resource, version, versionIdField, 'version');
    }
}

module.exports = ResourceVersionCombiner;
