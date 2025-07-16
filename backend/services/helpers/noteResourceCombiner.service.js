const BaseResourceCombiner = require('./baseResourceCombiner.service');
const {deepFreeze} = require('shared-utils/obj.utils');

/**
 * Combines resources with their related note documents
 * @extends BaseResourceCombiner<Readonly<OutputNote>>
 */
class ResourceNoteCombiner extends BaseResourceCombiner {
    /**
     * @private
     * @type {import('@/repositories/note.repository').NoteRepository}
     */
    #noteRepo;

    /**
     * Creates a new ResourceNoteCombiner instance
     * @param {Object} dependencies
     * @param {import('@/repositories/note.repository').NoteRepository} dependencies.noteRepo
     */
    constructor({noteRepo}) {
        super();
        this.#noteRepo = noteRepo;
    }

    /**
     * Combines resources with their note documents
     *
     * @param {Array<Object>} resources - Resources to combine with notes
     * @param {Object} [options] - Configuration options
     * @param {string} [options.noteIdField='noteId'] - Field containing note reference
     * @param {Object|string} [options.projection] - Fields to include from notes
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Array<Readonly<Object>>>>} Frozen array of resources with notes attached
     *
     * @example
     * await combiner.combineWithNotes(
     *   [{id: '1', noteId: 'n1'}, {id: '2', payload: {noteId: 'n2'}}],
     *   {noteIdField: 'payload.noteId', projection: {text: 1}}
     * )
     */
    async combineWithNotes(resources, {noteIdField = 'noteId', projection = null, session = null} = {}) {
        if (!resources?.length) return deepFreeze([]);

        const noteIds = [
            ...new Set(resources.map(r => this._extractNestedId(r, noteIdField)).filter(Boolean))
        ];

        if (!noteIds.length) return deepFreeze([]);

        const notes = await this.#noteRepo.findByIds(noteIds, {projection, session});
        return this._combineAll(resources, notes, noteIdField, 'note');
    }

    /**
     * Combines a single resource with its note document
     *
     * @param {Object} resource - The resource to combine with note
     * @param {Object} [options] - Configuration options
     * @param {string} [options.noteIdField='noteId'] - Field containing note reference
     * @param {Object|string} [options.projection] - Fields to include from note
     * @param {import('mongoose').ClientSession} [options.session] - MongoDB session
     * @returns {Promise<Readonly<Object>>} Frozen combined object with note
     *
     * @example
     * await combiner.combineWithSingleNote(
     *   {id: '1', noteId: 'n1'},
     *   {noteIdField: 'noteId', projection: {text: 1}}
     * )
     */
    async combineWithSingleNote(resource, {noteIdField = 'noteId', projection = null, session = null} = {}) {
        if (!resource) return null;

        const noteId = this._extractNestedId(resource, noteIdField);
        if (!noteId) return null;

        const note = await this.#noteRepo.findById(noteId, session, projection);
        return this._combineSingle(resource, note, noteIdField, 'note');
    }
}

module.exports = ResourceNoteCombiner;
