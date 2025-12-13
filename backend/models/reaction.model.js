const mongoose = require('mongoose');
const {REACTION_TYPES} = require('@/constants/reaction.constants');

const ReactionSchema = new mongoose.Schema({
    noteId: {type: mongoose.Schema.Types.ObjectId, ref: 'Note', required: true, index: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
    type: {
        type: String, enum: REACTION_TYPES, required: true,
        validate: {
            validator: function (type) {
                return REACTION_TYPES.includes(type);
            },
            message: props => `${props.value} is not a valid reaction type. Valid types: ${REACTION_TYPES.join(', ')}`
        }
    }
}, {timestamps: true});


// Compound unique index to ensure one reaction per user per note
ReactionSchema.index({
    noteId: 1,
    userId: 1
}, {
    unique: true,
    name: 'noteId_userId_unique'
});

// Compound index for efficient querying by noteId with timestamp sorting
ReactionSchema.index({
    noteId: 1,
    createdAt: -1
}, {
    name: 'noteId_createdAt_desc'
});

// Compound index for efficient querying by userId with timestamp sorting
ReactionSchema.index({
    userId: 1,
    createdAt: -1
}, {
    name: 'userId_createdAt_desc'
});

// Compound index for querying by type with timestamp
ReactionSchema.index({
    type: 1,
    createdAt: -1
}, {
    name: 'type_createdAt_desc'
});

const Reaction = mongoose.model('Reaction', ReactionSchema);

mongoose.connection.once('open', () => {
    Reaction.createIndexes().catch((err) => console.error('Error creating Reaction indexes:', err));
});

module.exports = Reaction;
