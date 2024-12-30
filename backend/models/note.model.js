const mongoose = require('mongoose');
const { Schema } = mongoose;
/**
 * I'll modify this schema to enable n-gram text search for the title, tags, and
 * content fields to facilitate fast text searching. Additionally,
 * I'll sanitize the content by removing Markdown characters for better search results
 */
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
noteSchema.index({ userId: 1, isPinned: -1, title: 1, createdAt: -1, updatedAt: -1 });
// Full-text search index
noteSchema.index({ title: "text", tags: "text"});

const Note = mongoose.model('Note', noteSchema);
(async () => (await Note.ensureIndexes()))();
module.exports = Note;