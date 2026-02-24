const {convertToObjectId, sanitizeMongoObject} = require('@/utils/obj.utils');
const AppError = require("@/errors/app.error");
const {internalServerError} = require("@/errors/factory.error");
const {deepFreeze} = require("shared-utils/obj.utils");
const {isValidObjectId} = require("@/utils/obj.utils");
const resources = require("@/enums/resources.enum")

/**
 * Represents a single note document returned from search operations.
 * @typedef {Object} OutputNote
 * @property {import('mongoose').Types.ObjectId} _id - Note ID
 * @property {string} title - Note title
 * @property {Array<string>} tags - Associated tags
 * @property {boolean} isPublic - Public visibility flag
 * @property {import('mongoose').Types.ObjectId} userId - Owner user ID
 * @property {ReactionCounts} reactionsCount - Reaction counts
 * @property {Date} createdAt - Creation timestamp
 * @property {Date} updatedAt - Last update timestamp
 * @property {boolean} [isPinned] - Pin status (excluded in some queries)
 * @property {number} [score] - Search relevance score (Atlas Search meta)
 * @property {string} [searchAfter] - Cursor token for pagination (Atlas Search meta)
 */

/**
 * Paginated search result wrapper with cursor-based navigation.
 * @typedef {Object} SearchResult
 * @property {Array<OutputNote>} data - Array of notes returned
 * @property {string|null} nextCursor - Cursor token for next page (null if last page)
 * @property {string|null} prevCursor - Cursor token for previous page (null if first page)
 */

/**
 * Available sort presets for note search queries.
 * @typedef {'relevance' | 'newest' | 'updated' | 'pinned'} NoteSortPresetsType
 */
const NOTE_SORT_PRESETS = Object.freeze({
    relevance: "relevance",
    newest: "newest",
    updated: "updated",
    pinned: "pinned"
});

/**
 * Sort configuration mapping preset names to indexed field sort orders.
 * Order matters: primary → secondary → tie-breaker.
 * @typedef {Object<NoteSortPresetsType, Array<Record<string, 'asc' | 'desc'>>>} SortPresets
 */
const SORT_PRESETS = /** @type {SortPresets} */ (Object.freeze({
    /**
     * Sort by relevance score (highest first), with _id descending as tie-breaker.
     * Empty array means Atlas Search uses default score-based ordering.
     */
    relevance: [],

    /**
     * Sort by creation date (newest first), then _id descending.
     */
    newest: [
        {createdAt: 'desc'},
        {_id: 'desc'}
    ],

    /**
     * Sort by last update date (most recent first), then _id descending.
     */
    updated: [
        {updatedAt: 'desc'},
        {_id: 'desc'}
    ],

    /**
     * Sort pinned notes first, then by update date, then _id descending.
     */
    pinned: [
        {isPinned: 'desc'},
        {updatedAt: 'desc'},
        {_id: 'desc'}
    ]
}));

/**
 * MongoDB Atlas Search service for Notes collection.
 *
 * **Architecture:**
 * - Uses ONLY Atlas Search indexes (no MongoDB post-query sort/skip)
 * - Cursor-based pagination for consistent performance at any offset
 * - All filtering and sorting happens at index level
 *
 * **Features:**
 * - Full-text search with fuzzy matching (1 edit distance)
 * - Autocomplete using edgeGram tokenization
 * - Multiple sort presets (relevance, newest, updated, pinned)
 * - Permission-aware searching (public + allowed private notes)
 * - Transaction-safe operations via optional session parameter
 *
 * **Performance:**
 * - Scalable to millions of documents
 * - O(1) pagination (cursor-based, not skip-based)
 * - Index-only queries (no collection scans)
 *
 * @class NoteSearchService
 */
class NoteSearchService {
    /**
     * Atlas Search index name configured in MongoDB Atlas.
     * @private
     * @type {string}
     */
    #INDEX_NAME = 'default';

    /**
     * Mongoose model for the Notes collection.
     * @private
     * @type {import('mongoose').Model}
     */
    #noteModel;

    /**
     * Repository for checking user permissions on private notes.
     * @private
     * @type {PermissionRepository}
     */
    #permissionRepo;

    /**
     * Creates a new NoteSearchService instance.
     *
     * @param {Object} deps - Dependency injection container
     * @param {import('mongoose').Model} deps.noteModel - Mongoose Note model
     * @param {PermissionRepository} deps.permissionRepo - Permission repository instance
     *
     * @example
     * const searchService = new NoteSearchService({
     *   noteModel: Note,
     *   permissionRepo: new PermissionRepository()
     * });
     */
    constructor({noteModel, permissionRepo}) {
        this.#noteModel = noteModel;
        this.#permissionRepo = permissionRepo;
    }

    /**
     * Sanitizes a note MongoDB object.
     *
     * Converts internal fields and ensures the userId is returned as a string.
     *
     * @private
     * @param {Object} note - The note object retrieved from MongoDB.
     * @returns {Object} The sanitized note object.
     */
    #sanitizeNoteMongoObject(note) {
        return {
            ...sanitizeMongoObject(note),
            ...(note.userId ? {userId: note.userId.toString()} : {})
        };
    }

    /* ──────────────────────────── SORT ──────────────────────────── */

    /**
     * Resolves a sort preset key to its indexed field configuration.
     * Falls back to 'relevance' if key is invalid.
     *
     * @private
     * @param {NoteSortPresetsType} [key='relevance'] - Sort preset key
     * @returns {Array<Record<string, 'asc' | 'desc'>>} Array of field sort orders for Atlas Search
     *
     * @example
     * this.#getSortPreset('newest') // [{ createdAt: 'desc' }, { _id: 'desc' }]
     * this.#getSortPreset('invalid') // [] (relevance fallback)
     */
    #getSortPreset(key = NOTE_SORT_PRESETS.relevance) {
        return SORT_PRESETS[key] || SORT_PRESETS.relevance;
    }

    /**
     * Converts Atlas sort array format to MongoDB sort document format.
     * Transforms 'asc'/'desc' strings to 1/-1 numeric values.
     *
     * @private
     * @param {Array<Record<string, "asc" | "desc">>} sortArray - Array of sort field objects
     * @returns {Array<Record<string, 1 | -1>>} MongoDB-compatible sort document
     *
     * @example
     * this.#normalizeSort([{ score: 'desc' }, { _id: 'asc' }])
     * // Returns: [{ score: -1}, {_id: 1 }]
     */
    #normalizeSort(sortArray) {
        return sortArray.reduce((acc, curr) => {
            const key = Object.keys(curr)[0];
            acc[key] = curr[key] === 'desc' ? -1 : 1;
            return acc;
        }, {});
    }

    /* ───────────────────────── SEARCH CONDITIONS ───────────────────────── */

    /**
     * Builds Atlas Search compound query conditions for text and autocomplete matching.
     *
     * **Search Strategy:**
     * - `text` operator: Full-text search on title/tags with fuzzy matching (3x boost)
     * - `autocomplete` operator: Prefix matching on title (2x boost)
     * - `autocomplete` operator: Prefix matching on tags (2x boost)
     *
     * All operators use:
     * - 1 max edit distance for fuzzy matching
     * - 2 character prefix length (prevents over-fuzzing short words)
     *
     * @private
     * @param {string} searchText - Raw user search input
     * @returns {Array<Object>} Array of Atlas Search operator objects for compound.must
     *
     * @example
     * this.#buildSearchConditions('javascrpt') // Fuzzy matches "javascript"
     * // Returns 3 conditions: text + 2 autocomplete operators
     */
    /**
     * Builds Atlas Search compound query conditions for text and autocomplete matching.
     */
    async #buildSearchConditions(searchText) {
        const query = searchText?.trim();
        if (!query) return [];

        // 1. Shared Configurations
        const fuzzyConfig = {maxEdits: 1, prefixLength: 2};
        const AUTOCOMPLETE_PATHS = [{path: 'title', boost: 2}, {path: 'tags', boost: 1}];

        // 2. Define the Full-Text Condition (Highest Boost)
        const textSearch = {
            text: {
                query,
                path: ['title', 'tags'],
                fuzzy: fuzzyConfig,
                score: {boost: {value: 4}}
            }
        };

        // 3. Define Autocomplete Conditions (Medium Boost)
        // Map through paths to avoid duplicate code blocks
        const autocompleteSearches = AUTOCOMPLETE_PATHS.map(({path, boost}) => ({
            autocomplete: {
                query,
                path,
                tokenOrder: 'any',
                fuzzy: fuzzyConfig,
                score: {boost: {value: boost}}
            }
        }));

        // 4. Combine into a single flat array
        return [textSearch, ...autocompleteSearches];
    }

    /**
     * Builds Atlas Search equality filter conditions for indexed fields.
     * Only includes filters for provided query parameters.
     *
     * **Supported Filters:**
     * - `userId`: Exact match on note owner
     * - `isPublic`: Boolean match on visibility flag
     *
     * @private
     * @param {Object} query - Filter parameters
     * @param {string} [query.userId] - Filter by owner user ID
     * @param {boolean} [query.isPublic] - Filter by public visibility
     * @returns {Array<Object>} Array of Atlas Search filter conditions for compound.filter
     *
     * @example
     * this.#buildFilterConditions({ userId: '507f1f77bcf86cd799439011', isPublic: true })
     * // Returns 2 equals filters
     */
    #buildFilterConditions(query) {
        const filters = [];

        if (query.userId && isValidObjectId(query.userId)) {
            filters.push({
                equals: {
                    path: 'userId',
                    value: convertToObjectId(query.userId)
                }
            });
        }

        if (typeof query.isPublic === 'boolean') {
            filters.push({
                equals: {
                    path: 'isPublic',
                    value: query.isPublic
                }
            });
        }

        return filters;
    }

    /**
     * Executes Atlas Search pipeline and returns paginated results with cursors.
     *
     * **Pagination Strategy:**
     * - Fetches limit+1 documents to detect if next page exists
     * - Returns only `limit` documents to user
     * - Includes `searchAfter` token from last document for next page
     *
     * **Scoring:**
     * - Injects `searchScore` metadata into each result
     * - Injects `searchSequenceToken` for cursor-based pagination
     *
     * @private
     * @param {Object} params
     * @param {Array<Object>} params.searchConditions - Atlas Search must conditions
     * @param {Array<Object>} params.filterConditions - Atlas Search filter conditions
     * @param {Object} params.options - Pagination and sort options
     * @param {number} [options.limit=10] - Number of results per page
     * @param {string|null} [options.cursor=null] - Cursor token from previous page
     * @param {NoteSortPresetsType} [options.sortKey='relevance'] - Sort preset key
     * @param {Record<string, 1|0>} [options.projection={}] - Fields to include/exclude
     * @param {import('mongoose').ClientSession|null} [params.session=null] - MongoDB transaction session
     * @returns {Promise<SearchResult>} Paginated search results with navigation cursors
     *
     * @example
     * const result = await this.#executeSearchResult({
     *   searchConditions,
     *   filterConditions,
     *   options: { limit: 20, cursor: 'abc123', sortKey: 'newest' }
     * });
     * // result.data.length <= 20, result.nextCursor available if more pages exist
     */
    async #executeSearchResult({
                                   searchConditions,
                                   filterConditions,
                                   options = {},
                                   session = null
                               }) {
        const {
            limit = 10,
            cursor = null,
            sortKey = NOTE_SORT_PRESETS.relevance,
            projection = {}
        } = options;

        const sort = this.#getSortPreset(sortKey);

        const projectionStage = {
            ...projection,
            isPublic: 0,
            score: {$meta: 'searchScore'},
            searchAfter: {$meta: 'searchSequenceToken'}
        }

        const pipeline = [
            this.#buildSearchStage({
                searchConditions,
                filterConditions,
                sort,
                searchAfter: cursor
            }),
            ...(Object.keys(projectionStage).length ? [{$project: projectionStage}] : []),
            {$limit: limit + 1}
        ];

        const docs = await this.#noteModel.aggregate(pipeline).session(session);
        const hasNext = docs.length > limit;
        const data = hasNext ? docs.slice(0, limit) : docs;

        return deepFreeze({
            data: data.map(this.#sanitizeNoteMongoObject),
            nextCursor: hasNext ? data[data.length - 1].searchAfter : null,
            prevCursor: cursor || null
        });
    }

    /* ───────────────────────── SEARCH STAGE ───────────────────────── */

    /**
     * Constructs the MongoDB Atlas $search aggregation stage.
     *
     * **Structure:**
     * - `compound.must`: Scoring conditions (text/autocomplete operators)
     * - `compound.filter`: Boolean filters (must match, no scoring impact)
     * - `sort`: Optional indexed field sorting
     * - `searchAfter`: Optional cursor for pagination
     *
     * @private
     * @param {Object} options - Search stage configuration
     * @param {Array<Object>} options.searchConditions - Scoring operators for compound.must
     * @param {Array<Object>} options.filterConditions - Filter operators for compound.filter
     * @param {Array<Record<string, "asc" | "desc">>|null} [options.sort=null] - Sort field configuration
     * @param {string|null} [options.searchAfter=null] - Cursor token from previous page
     * @returns {Object} Complete $search stage object
     *
     * @example
     * this.#buildSearchStage({
     *   searchConditions: [{ text: {...} }],
     *   filterConditions: [{ equals: {...} }],
     *   sort: [{ createdAt: 'desc' }],
     *   searchAfter: 'cursor_token'
     * })
     * // Returns: { $search: { index: 'default', compound: {...}, sort: {...}, searchAfter: '...' } }
     */
    #buildSearchStage({
                          searchConditions,
                          filterConditions,
                          sort,
                          searchAfter
                      }) {
        const stage = {
            index: this.#INDEX_NAME,
            compound: {}
        };

        if (searchConditions && searchConditions.length) {
            stage.compound.must = [
                {
                    compound: {
                        should: searchConditions,
                        minimumShouldMatch: 1
                    }
                }
            ];
        }

        if (filterConditions && filterConditions.length)
            stage.compound.filter = filterConditions;

        if (sort && sort.length) stage.sort = this.#normalizeSort(sort);
        if (searchAfter) stage.searchAfter = searchAfter;

        return {$search: stage};
    }

    /* ───────────────────────── PUBLIC SEARCH ───────────────────────── */

    /**
     * Searches notes with full-text matching and cursor-based pagination.
     *
     * **Use Case:** General note search with explicit filters (e.g., admin queries).
     *
     * **Features:**
     * - Full-text + autocomplete search on title/tags
     * - Fuzzy matching (1 edit distance)
     * - Optional userId and isPublic filters
     * - Configurable sort presets
     * - Cursor-based pagination (no performance degradation at high offsets)
     *
     * @param {string} searchText - Search query string
     * @param {Object} [query={}] - Filter options
     * @param {string} [query.userId] - Filter by note owner
     * @param {boolean} [query.isPublic] - Filter by public visibility
     * @param {Object} [options={}] - Pagination and sort options
     * @param {number} [options.limit=10] - Results per page
     * @param {string|null} [options.cursor=null] - Pagination cursor from previous result
     * @param {NoteSortPresetsType} [options.sortKey='relevance'] - Sort preset
     * @param {import('mongoose').ClientSession|null} [session=null] - Transaction session
     * @returns {Promise<SearchResult | null>} Paginated search results
     *
     * @example
     * const results = await service.search('javascript',
     *   { isPublic: true },
     *   { limit: 20, sortKey: 'newest' }
     * );
     * console.log(results.data.length); // Up to 20 notes
     * console.log(results.nextCursor); // Use for next page
     */
    async search(searchText, query = {}, options = {}, session = null) {
        if (!searchText?.trim() && !Object.keys(query).length) return null;

        try {
            const searchConditions = await this.#buildSearchConditions(searchText);
            const filterConditions = this.#buildFilterConditions(query);

            return this.#executeSearchResult({
                searchConditions,
                filterConditions,
                options,
                session
            });
        } catch (err) {
            console.error('[NoteSearchService.search]', err);
            if (err instanceof AppError) {
                throw err;
            }
            throw internalServerError();
        }
    }


    /* ───────────────────────── SEARCH FOR USER ───────────────────────── */

    /**
     * Builds permission-aware Atlas Search filters for a specific user.
     *
     * **Permission Logic:**
     * - Public notes: Always searchable by everyone
     * - Private notes: Searchable ONLY if user has explicit permission
     *
     * **Implementation:**
     * - Queries PermissionRepository for allowed private note IDs
     * - Constructs `OR` filter: public=true OR _id IN [allowed_ids]
     * - If no private permissions, returns single public filter
     *
     * **Performance:**
     * - Uses indexed `terms` operator for ID matching
     * - Relies only on indexed fields (isPublic, _id)
     *
     * @private
     * @param {string} userId - Requesting user's ID
     * @param {import('mongoose').ClientSession|null} [session=null] - Transaction session
     * @returns {Promise<Array<Object>>} Atlas Search filter conditions for compound.filter
     *
     * @example
     * const filters = await this.#buildFilterForUser('user123');
     * // Returns: [{ or: [{ equals: {...isPublic} }, { terms: {..._id} }] }]
     * // Or if no private access: [{ equals: {...isPublic} }]
     */
    async #buildFilterForUser(userId, session) {
        const publicFilter = {equals: {path: 'isPublic', value: true}};
        const allowedIds = await this.#permissionRepo.getAllowedResourceIds({
            userId,
            resourceType: resources.NOTE
        }, {session});

        if (allowedIds.length) {
            const privateFilter = {terms: {path: '_id', value: allowedIds.map(convertToObjectId)}};
            return [{or: [publicFilter, privateFilter]}];
        }
        return [publicFilter];
    }

    /**
     * Searches notes visible to a specific user (public + explicitly allowed private notes).
     *
     * **Use Case:** User-facing search with automatic permission filtering.
     *
     * **Behavior:**
     * - Always returns public notes
     * - Includes private notes where user has permission
     * - Forces 'relevance' sort (ignores pinned/updated sorts)
     * - Excludes `isPinned` field from results
     *
     * **Security:**
     * - Permission check happens at repository level
     * - No private note leakage possible
     *
     * @param {string} searchText - Search query string
     * @param {Object} query - User context
     * @param {string} query.userId - Requesting user's ID (required)
     * @param {Object} [options={}] - Pagination options
     * @param {number} [options.limit=10] - Results per page
     * @param {string|null} [options.cursor=null] - Pagination cursor
     * @param {import('mongoose').ClientSession|null} [session=null] - Transaction session
     * @returns {Promise<SearchResult | null>} Paginated search results with only visible notes
     *
     * @example
     * const results = await service.searchForUser('mongodb',
     *   { userId: 'user123' },
     *   { limit: 15 }
     * );
     * // Returns public notes + private notes user123 can access
     */
    async searchForUser(searchText, {userId}, options = {}, session = null) {
        if (!searchText.trim() && !userId) return null;

        try {
            const searchConditions = await this.#buildSearchConditions(searchText);
            const filterConditions = await this.#buildFilterForUser(userId, session);

            return this.#executeSearchResult({
                searchConditions,
                filterConditions,
                options: {
                    ...options,
                    sortKey: NOTE_SORT_PRESETS.relevance,
                    projection: {isPinned: 0}
                },
                session
            });

        } catch (err) {
            console.error('[NoteSearchService.searchForUser]', err);
            if (err instanceof AppError) {
                throw err;
            }
            throw internalServerError();
        }
    }

    /* ───────────────────────── AUTOCOMPLETE ───────────────────────── */

    /**
     * Builds aggregation pipeline for autocomplete suggestions.
     *
     * **Strategy:**
     * - Searches title and tags with autocomplete operators
     * - Fetches 3x requested limit to allow deduplication
     * - Groups by suggestion text (deduplicates)
     * - Keeps highest score per unique suggestion
     * - Sorts by score descending, then alphabetically
     * - Returns top N unique suggestions
     *
     * @private
     * @param {string} searchText - Partial user input
     * @param {Array<Object>} filterConditions - Atlas Search filters
     * @param {number} limit - Max unique suggestions to return
     * @returns {Array<Object>} MongoDB aggregation pipeline
     *
     * @example
     * this.#buildAutocompletePipeline('java', filters, 5)
     * // Returns pipeline that yields max 5 suggestions like "javascript", "java basics", etc.
     */
    #buildAutocompletePipeline(searchText, filterConditions, limit) {
        // 1. Configuration & Constants
        const FUZZY_OPTIONS = {maxEdits: 1, prefixLength: 2};
        const SEARCH_PATHS = ['title', 'tags'];
        const OVERSAMPLING_FACTOR = 3;

        // 2. Build Search Conditions
        const mustConditions = SEARCH_PATHS.map(path => ({
            autocomplete: {
                query: searchText,
                path: path,
                tokenOrder: 'any',
                fuzzy: FUZZY_OPTIONS,
            }
        }));

        // 3. Define Pipeline Stages
        const searchStage = this.#buildSearchStage({
            searchConditions: mustConditions,
            filterConditions,
        });

        const initialLimitStage = {
            $limit: limit * OVERSAMPLING_FACTOR
        };

        const projectionStage = {
            $project: {
                _id: 0,
                suggestion: '$title',
                score: {$meta: 'searchScore'}
            }
        };

        // Deduplicate: Keep highest score for each unique suggestion
        const groupStage = {
            $group: {
                _id: '$suggestion',
                score: {$max: '$score'}
            }
        };

        const sortStage = {$sort: {score: -1, _id: 1}};
        const finalLimitStage = {$limit: limit};
        const formatStage = {$project: {suggestion: '$_id', _id: 0}};

        // 4. Return Combined Pipeline
        return [
            searchStage,
            initialLimitStage,
            projectionStage,
            groupStage,
            sortStage,
            finalLimitStage,
            formatStage
        ];
    }

    /**
     * Returns autocomplete suggestions for user-visible notes (permission-aware).
     *
     * **Use Case:** User-facing autocomplete dropdown.
     *
     * **Features:**
     * - Suggests based on note titles and tags
     * - Respects user permissions (public + allowed private)
     * - Deduplicates suggestions
     * - Minimum 2 characters required
     * - Returns empty array for short/empty input
     *
     * @param {string} searchText - Partial user input
     * @param {Object} query - User context
     * @param {string} query.userId - Requesting user's ID
     * @param {number} [limit=5] - Max suggestions to return
     * @param {import('mongoose').ClientSession|null} [session=null] - Transaction session
     * @returns {Promise<Array<string>>} Array of unique suggestion strings
     *
     * @example
     * const suggestions = await service.getAutocompleteSuggestionsForUser(
     *   'jav',
     *   { userId: 'user123' },
     *   5
     * );
     * // Returns: ['javascript basics', 'java tutorial', 'javafx guide', ...]
     */
    async getAutocompleteSuggestionsForUser(searchText, {userId}, limit = 5, session = null) {
        try {
            if (!searchText?.trim() || searchText.trim().length < 2) return [];

            const filterConditions = await this.#buildFilterForUser(userId, session);

            const pipeline = this.#buildAutocompletePipeline(searchText.trim(), filterConditions, limit);
            const result = await this.#noteModel.aggregate(pipeline).session(session);

            return result.map(doc => doc.suggestion);
        } catch (err) {
            console.error('[NoteSearchService.getAutocompleteSuggestionsForUser]', err);
            if (err instanceof AppError) {
                throw err;
            }
            throw internalServerError();
        }
    }

    /**
     * Returns autocomplete suggestions with explicit filters (no permission logic).
     *
     * **Use Case:** Admin/public autocomplete without user context.
     *
     * **Features:**
     * - Suggests based on note titles and tags
     * - Supports explicit userId/isPublic filters
     * - Deduplicates suggestions
     * - Minimum 2 characters required
     *
     * @param {string} searchText - Partial user input
     * @param {Object} [query={}] - Filter options
     * @param {string} [query.userId] - Filter by note owner
     * @param {boolean} [query.isPublic] - Filter by visibility
     * @param {number} [limit=5] - Max suggestions to return
     * @param {import('mongoose').ClientSession|null} [session=null] - Transaction session
     * @returns {Promise<Array<string>>} Array of unique suggestion stringsa
     *
     * @example
     * const suggestions = await service.getAutocompleteSuggestions(
     *   'react',
     *   { isPublic: true },
     *   10
     * );
     * // Returns up to 10 public note titles/tags matching 'react'
     */
    async getAutocompleteSuggestions(searchText, query = {}, limit = 5, session = null) {
        try {
            if (!searchText?.trim() || searchText.trim().length < 2) return [];

            const filterConditions = this.#buildFilterConditions(query);

            const pipeline = this.#buildAutocompletePipeline(searchText.trim(), filterConditions, limit);
            const result = await this.#noteModel.aggregate(pipeline).session(session);

            return result.map(doc => doc.suggestion);
        } catch (err) {
            console.error('[NoteSearchService.getAutocompleteSuggestions]', err);
            if (err instanceof AppError) {
                throw err;
            }
            throw internalServerError();
        }
    }
}

module.exports = NoteSearchService;
