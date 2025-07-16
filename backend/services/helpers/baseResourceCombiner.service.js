const {deepFreeze, deepClone} = require('shared-utils/obj.utils');

/**
 * Abstract base class for combining resources with their related documents (notes, versions, etc.)
 * Provides core functionality for ID extraction, field removal, and document combination
 *
 * @template T - Type of the related document (Note, Version, etc.)
 * @abstract
 */
class BaseResourceCombiner {
    /**
     * Extracts a nested value from an object using dot notation path (supports up to 3 levels deep)
     *
     * @protected
     * @param {Object} obj - Source object to extract from
     * @param {string} path - Dot notation path (e.g. 'payload.noteId' or 'versionId')
     * @returns {string|null} Extracted ID as string, or null if path doesn't exist
     * @throws {Error} If nesting depth exceeds 3 levels
     *
     * @example
     * _extractNestedId({payload: {noteId: '123'}}, 'payload.noteId') // returns '123'
     * _extractNestedId({id: '456'}, 'id') // returns '456'
     * _extractNestedId({}, 'missing.path') // returns null
     */
    _extractNestedId(obj, path) {
        const parts = path.split('.');
        if (parts.length > 3) throw new Error('Maximum nesting depth of 3 exceeded');

        try {
            let value = obj;
            for (const part of parts) {
                if (!value || typeof value !== 'object') return null;
                value = value[part];
            }
            return value?.toString() || null;
        } catch {
            return null;
        }
    }

    /**
     * Creates a deep clone of the resource object with the specified ID field removed
     * Handles both top-level and nested fields (up to 3 levels deep)
     *
     * @protected
     * @param {Object} resource - Original resource object
     * @param {string} idField - Field to remove (supports dot notation)
     * @returns {Object} New object clone without the specified ID field
     *
     * @example
     * _removeIdField({id: '1', noteId: '123'}, 'noteId') // returns {id: '1'}
     * _removeIdField({payload: {noteId: '123'}}, 'payload.noteId') // returns {payload: {}}
     */
    _removeIdField(resource, idField) {
        const cloned = deepClone(resource);
        const parts = idField.split('.');

        if (parts.length === 1) {
            delete cloned[idField];
        } else {
            let obj = cloned;
            for (let i = 0; i < parts.length - 1; i++) {
                if (!obj[parts[i]]) return cloned;
                obj = obj[parts[i]];
            }
            delete obj[parts[parts.length - 1]];
        }

        return cloned;
    }

    /**
     * Combines a single resource with its related document
     * Returns a frozen object with the document attached under the specified key
     *
     * @protected
     * @param {Object} resource - The base resource object
     * @param {T|null} doc - Related document to combine (or null if not found)
     * @param {string} idField - Field name that references the document ID
     * @param {string} docKey - Property name to use for the combined document
     * @returns {Readonly<Object>} Frozen combined object
     *
     * @example
     * _combineSingle(
     *   {id: '1', noteId: '123'},
     *   {id: '123', text: 'Note content'},
     *   'noteId',
     *   'note'
     * )
     * // Returns frozen {id: '1', note: {id: '123', text: 'Note content'}}
     */
    _combineSingle(resource, doc, idField, docKey) {
        const resourceData = this._removeIdField(resource, idField);
        return deepFreeze({
            ...resourceData,
            [docKey]: doc ? deepFreeze(doc) : null
        });
    }

    /**
     * Combines multiple resources with their related documents
     * Filters out resources where no matching document was found
     *
     * @protected
     * @param {Array<Object>} resources - Array of resource objects
     * @param {ReadonlyArray<T>} docs - Array of related documents
     * @param {string} idField - Field name that references the document ID
     * @param {string} docKey - Property name to use for the combined documents
     * @returns {Readonly<Array<Readonly<Object>>>} Frozen array of combined objects
     *
     * @example
     * _combineAll(
     *   [{id: '1', noteId: '123'}, {id: '2', noteId: '456'}],
     *   [{id: '123', text: 'Note 1'}],
     *   'noteId',
     *   'note'
     * )
     * // Returns frozen [{id: '1', note: {id: '123', text: 'Note 1'}}]
     */
    _combineAll(resources, docs, idField, docKey) {
        const combined = resources.map(resource => {
            const id = this._extractNestedId(resource, idField);
            const doc = docs.find(d => d?.id === id);
            return this._combineSingle(resource, doc, idField, docKey);
        });

        return deepFreeze(combined.filter(x => x[docKey] !== null));
    }
}

module.exports = BaseResourceCombiner;
