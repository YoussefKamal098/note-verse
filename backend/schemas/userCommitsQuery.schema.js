const objectIdSchema = require('./idKeyObject.schema');
const paginationSchema = require('./paginationQuery.schema');

module.exports = paginationSchema.keys({
    noteId: objectIdSchema().required().description('Filter by note ID')
});
