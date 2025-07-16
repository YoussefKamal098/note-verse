const mongoose = require('mongoose');
const {Schema} = mongoose;
const authProvider = require('../enums/auth.enum');

const authProviderSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        index: true,
        required: true,
        unique: true
    },
    provider: {
        type: String,
        enum: Object.values(authProvider).filter(p => p !== authProvider.LOCAL),
        required: true
    },
    providerId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    avatarUrl: String
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

// Compound index for unique provider associations
authProviderSchema.index({provider: 1, providerId: 1}, {unique: true});

const AuthProvider = mongoose.model('AuthProvider', authProviderSchema);

module.exports = AuthProvider;
