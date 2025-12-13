const Joi = require('joi');
const {Reactions} = require("@/constants/reaction.constants")

const reactionTypeSchema = Joi.object({
    type: Joi.string()
        .valid(...Object.values(Object.values(Reactions)), null)
        .allow(null)
        .messages({
            'any.only': 'Reaction type must be one of: ' + Object.values(Reactions).join(', ') + ', or null to remove reaction'
        })
});

module.exports = reactionTypeSchema;
