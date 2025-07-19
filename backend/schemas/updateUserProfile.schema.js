const Joi = require('joi');

const nameSchema = Joi.string()
    .regex(/^(?!\d)[a-zA-Z0-9_]{3,15}$/)
    .messages({
        'string.base': 'Name must be a string',
        'string.pattern.base': 'Name must be 3-15 chars begin with a letter, numbers, underscores'
    });

const updateProfileSchema = Joi.object({
    firstname: nameSchema.label('First name'),
    lastname: nameSchema.label('Last name')
}).min(1).message('At least one field must be provided');


module.exports = updateProfileSchema;
