const Joi = require('joi');

const userSchema = Joi.object({
    firstname: Joi.string()
        .required()
        .regex(/^(?!\d)[a-zA-Z0-9_]{3,15}$/)
        .messages({
            'string.base': 'First name must be a string',
            'string.empty': 'First name is required',
            'string.pattern.base': 'First name must be 3-15 chars begin with a letter, numbers, underscores'
        }),
    lastname: Joi.string()
        .required()
        .regex(/^(?!\d)[a-zA-Z0-9_]{3,15}$/)
        .messages({
            'string.base': 'Last name must be a string',
            'string.empty': 'Last name is required',
            'string.pattern.base': 'Last name must be 3-15 chars begin with a letter, numbers, underscores'
        }),
    email: Joi.string()
        .required()
        .email()
        .messages({
            'string.base': 'Email must be a string',
            'string.empty': 'Email is required',
            'string.email': 'Invalid email format'
        }),
    password: Joi.string()
        .required()
        .regex(/^(?=.{8,20}$)(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]*$/)
        .messages({
            'string.base': 'Password must be a string',
            'string.empty': 'Password is required',
            'string.pattern.base': 'Password must contain uppercase, lowercase, number, and special character'
        })
});

module.exports = userSchema;