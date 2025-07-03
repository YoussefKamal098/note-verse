const Joi = require('joi');
const objectIdSchema = require('./idKeyObject.schema')

const getUserQuerySchema = Joi.object({
    id: objectIdSchema({allowMe: true}).description('User ID or "me" for current user'),
    email: Joi.string().email()
}).xor('id', 'email')  // Requires exactly one of id or email
    .messages({
        'object.xor': 'Must provide either id or email, but not both',
        'object.base': 'Query must contain exactly one parameter (id or email)'
    });

module.exports = getUserQuerySchema;
