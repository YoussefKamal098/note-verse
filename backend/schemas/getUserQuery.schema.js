const Joi = require('joi');
const {isValidObjectId} = require('../utils/obj.utils');

const getUserQuerySchema = Joi.object({
    id: Joi.string().custom((value, helpers) => {
        if (value === 'me') return value;  // Accept "me" as valid
        if (!isValidObjectId(value)) {
            return helpers.error('any.invalid');
        }
        return value;
    }, 'ObjectId validation or "me"'),
    email: Joi.string().email()
}).xor('id', 'email')  // Requires exactly one of id or email
    .messages({
        'object.xor': 'Must provide either id or email, but not both',
        'object.base': 'Query must contain exactly one parameter (id or email)'
    });

module.exports = getUserQuerySchema;
