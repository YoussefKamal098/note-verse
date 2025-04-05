/**
 * Service for paginating query results for a given Mongoose model.
 *
 * This class provides methods to paginate query results using MongoDB's aggregation framework.
 * It calculates metadata such as total items, total pages, current page, and determines the next and previous pages.
 *
 * @class NotePaginatorService
 */
class NotePaginatorService {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model to paginate.
     */
    #model;

    /**
     * Creates an instance of NotePaginatorService.
     *
     * @param {import('mongoose').Model} model - The Mongoose model to paginate.
     */
    constructor(model) {
        this.#model = model;
    }

    /**
     * Retrieves paginated results using MongoDB Atlas Search.
     *
     * Performs a full-text and filter-based search using the `$search` stage with a
     * `compound.must` clause. It applies sorting (based on a compound index order),
     * pagination, and excludes the `content` field from the returned documents.
     *
     * @param {Array<Object>} [query=[]] - Array of conditions for `$search.compound.must`.
     * @param {Object} [options={}] - Pagination and sorting options.
     * @param {number} [options.page=0] - The page number (0-indexed).
     * @param {number} [options.perPage=10] - Number of items per page.
     * @param {Object} [options.sort={isPinned: -1, updatedAt: -1, createdAt: -1}] - Sort criteria.
     * @returns {Promise<Object>} Object containing paginated search results and metadata.
     * @throws {Error} If an error occurs during aggregation.
     */
    async getPagination(query = [], options = {}) {
        const {
            page = 0,
            perPage = 10,
            sort = {isPinned: -1, updatedAt: -1, createdAt: -1}
        } = options;
        const skip = page * perPage;
        const pipeline = this.#buildAggregationPipeline(query, sort, skip, perPage);

        try {
            const result = await this.#model.aggregate(pipeline);
            const totalItems = result[0]?.metadata[0]?.totalItems || 0;
            const data = result[0]?.data || [];

            return {
                data,
                totalItems,
                totalPages: Math.ceil(totalItems / perPage),
                currentPage: page,
                perPage
            };
        } catch (error) {
            console.error("Pagination Error:", error);
            throw new Error("Pagination Error");
        }
    }

    /**
     * Constructs the aggregation pipeline for the paginated search.
     *
     * @param {Array<Object>} query - Conditions for the `$search.compound.must` clause.
     * @param {Object} sortObj - The sort object built from the compound index order.
     * @param {number} skip - Number of documents to skip.
     * @param {number} perPage - Number of documents per page.
     * @returns {Array<Object>} The aggregation pipeline.
     */
    #buildAggregationPipeline(query, sortObj, skip, perPage) {
        return [
            {
                $search: {
                    index: 'default', // Atlas Search index name.
                    compound: {must: query}
                }
            },
            {
                $facet: {
                    metadata: [{$count: "totalItems"}],
                    data: [
                        {$sort: sortObj},
                        {$project: {content: 0}}, // Exclude the 'content' field
                        {$skip: skip},
                        {$limit: perPage}
                    ]
                }
            }
        ];
    }
}

module.exports = NotePaginatorService;
