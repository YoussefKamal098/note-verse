const mongoose = require('mongoose');

const versionSchema = new mongoose.Schema({
    noteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Note',
        required: true,
        index: true
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    patch: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    previousVersion: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Version',
        default: null
    }
}, {
    timestamps: true,
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
});

// Indexes for optimized queries
versionSchema.index({previousVersion: 1}, {
    unique: true,
    partialFilterExpression: {previousVersion: {$type: "objectId"}}
});
versionSchema.index({noteId: 1, createdAt: -1});
versionSchema.index({noteId: 1, previousVersion: 1, createdAt: -1});
versionSchema.index({noteId: 1, createdBy: 1, createdAt: -1});
versionSchema.index({noteId: 1, createdBy: 1, previousVersion: 1, createdAt: -1});

const Version = mongoose.model('Version', versionSchema);

module.exports = Version;
