/**
 * Service for a paginating query results for a given Mongoose model.
 *
 * This class provides methods to paginate query results using MongoDB's aggregation framework.
 * It calculates metadata such as total items, total pages, current page, and determines the next and previous pages.
 *
 * @class PaginatorService
 */
class PaginatorService {
    /**
     * @private
     * @type {import('mongoose').Model}
     * @description The Mongoose model to paginate.
     */
    #model;
    /**
     * @private
     * @type {number}
     * @description The current page number (0-indexed).
     */
    #page;
    /**
     * @private
     * @type {number}
     * @description The number of items per page.
     */
    #perPage;
    /**
     * @private
     * @type {Object}
     * @description The sorting criteria.
     */
    #sort;

    /**
     * Creates an instance of PaginatorService.
     *
     * @param {import('mongoose').Model} model - The Mongoose model to paginate.
     * @param {Object} [options={}] - Pagination options.
     * @param {number} [options.page=0] - The initial page number (0-indexed).
     * @param {number} [options.perPage=10] - The number of items per page.
     * @param {Object} [options.sort={}] - The sorting criteria.
     */
    constructor(model, {page = 0, perPage = 10, sort = {}}) {
        this.#page = page;
        this.#perPage = perPage;
        this.#sort = sort;
        this.#model = model;
    }

    /**
     * Gets the current page number.
     *
     * @returns {number} The current page.
     */
    get page() {
        return this.#page;
    }

    /**
     * Sets the current page number.
     *
     * @param {number} page - The new page number.
     */
    set page(page) {
        this.#page = page;
    }

    /**
     * Gets the number of items per page.
     *
     * @returns {number} The number of items per page.
     */
    get perPage() {
        return this.#perPage;
    }

    /**
     * Sets the number of items per page.
     *
     * @param {number} perPage - The new items per page count.
     */
    set perPage(perPage) {
        this.#perPage = perPage;
    }

    /**
     * Gets the sorting criteria.
     *
     * @returns {Object} The sorting criteria.
     */
    get sort() {
        return this.#sort;
    }

    /**
     * Sets the sorting criteria.
     *
     * @param {Object} sort - The new sorting criteria.
     */
    set sort(sort) {
        this.#sort = sort;
    }

    /**
     * Calculates the number of documents to skip based on the current page and items per page.
     *
     * @returns {number} The number of documents to skip.
     */
    get skip() {
        return this.page * this.perPage;
    }

    /**
     * Retrieves paginated results for a given query.
     *
     * Uses MongoDB aggregation with a $facet stage to get both metadata and data.
     *
     * @param {Object} [query={}] - The MongoDB query to filter results.
     * @returns {Promise<Object>} An object containing:
     *  - data: the array of paginated documents,
     *  - totalItems: the total number of documents matching the query,
     *  - totalPages: the total number of pages,
     *  - currentPage: the current page number,
     *  - perPage: the number of items per page,
     *  - next: the next page number (if any),
     *  - prev: the previous page number (if any).
     * @throws {Error} If an error occurs during aggregation.
     */
    async getPagination(query = {}) {
        // I will implement cursor-based pagination later

        try {
            const result = await this.#model.aggregate([
                {$match: query},
                {
                    $facet: {
                        metadata: [
                            {$count: "totalItems"}
                        ],
                        data: [
                            {$sort: this.sort},
                            {$skip: this.skip},
                            {$limit: this.perPage}
                        ]
                    }
                }
            ]);

            const totalItems = result[0]?.metadata[0]?.totalItems || 0;
            const data = result[0]?.data || [];

            return {
                data,
                totalItems,
                totalPages: Math.ceil(totalItems / this.perPage),
                currentPage: this.page,
                perPage: this.perPage,
                next: this.getNextPage(totalItems),
                prev: this.getPrevPage()
            };

        } catch (error) {
            console.error("Pagination Error:", error);
            throw new Error("Pagination Error");
        }
    }

    /**
     * Determines the next page number based on the total number of items.
     *
     * @param {number} totalItems - The total number of items matching the query.
     * @returns {number|undefined} The next page number, or undefined if there is no next page.
     */
    getNextPage(totalItems) {
        return (this.page + 1) * this.perPage < totalItems ? this.page + 1 : undefined;
    }


    /**
     * Determines the previous page number.
     *
     * @returns {number|undefined} The previous page number, or undefined if on the first page.
     */
    getPrevPage() {
        return this.page >= 1 ? this.page - 1 : undefined;
    }
}

module.exports = PaginatorService;
