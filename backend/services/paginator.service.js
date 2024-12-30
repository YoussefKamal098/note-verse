class PaginatorService {
    #model;
    #page;
    #perPage;
    #sort;

    constructor(model, { page = 0, perPage = 10, sort = {} }) {
        this.#page = page;
        this.#perPage = perPage;
        this.#sort = sort;
        this.#model = model;
    }

    get page() {
        return this.#page;
    }

    get perPage() {
        return this.#perPage;
    }

    get sort() {
        return this.#sort;
    }

    get skip(){
        return this.page * this.perPage;
    }

    set page(page) {
        this.#page = page;
    }

    set perPage(perPage) {
        this.#perPage = perPage;
    }

    set sort(sort) {
        this.#sort = sort;
    }

    async getPagination(query = {}) {
        // I will implement cursor-based pagination later

        try {
            const result = await this.#model.aggregate([
                { $match: query },
                { $facet: {
                        metadata: [
                            { $count: "totalItems" }
                        ],
                        data: [
                            { $sort: this.sort },
                            { $skip: this.skip },
                            { $limit: this.perPage }
                        ]
                    }}
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
            return [];
        }
    }

    getNextPage(totalItems) {
        return (this.page + 1) * this.perPage < totalItems ? this.page + 1 : undefined;
    }

    getPrevPage() {
        return this.page >= 1 ? this.page - 1 : undefined;
    }
}

module.exports = PaginatorService;
