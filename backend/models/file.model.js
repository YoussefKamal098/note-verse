const mongoose = require('mongoose');
const {Schema} = mongoose;

const fileSchema = new Schema({
    name: {
        type: String,
        index: true,
        unique: true,
        required: true,
    },
    mimetype: {
        type: String,
        required: true, // MIME type (e.g., "image/png")
    },
    size: {
        type: Number,
        required: true, // File size in bytes
    },
    hash: {
        type: String,
        required: true, // Hash of the file for integrity verification and deduplication
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
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
        },
    },
});

fileSchema.index({_id: 1, userId: 1}, {unique: true});

const File = mongoose.model('File', fileSchema);

mongoose.connection.once('open', () => {
    File.createIndexes().catch((err) => console.error('Error creating File indexes:', err));
});

module.exports = File;
