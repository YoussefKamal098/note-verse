const mongoose = require('mongoose');
const {Schema} = mongoose;

const noteSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        index: true,
    },
    tags: {
        type: [String],
        required: true,
        index: true
    },
    content: {
        type: String,
        required: true
    },
    isPinned: {
        type: Boolean,
        default: false,
    },
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound index for filtering and sorting
noteSchema.index({isPinned: -1, updatedAt: -1, createdAt: -1, title: 1, tags: 1});

const Note = mongoose.model('Note', noteSchema);

mongoose.connection.once('open', () => {
    Note.createIndexes().catch((err) => console.error('Error creating Note indexes:', err));
});

module.exports = Note;
