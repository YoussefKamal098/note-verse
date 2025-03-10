const mongoose = require('mongoose');
const AuthProvider = require('../enums/auth.enum');
const {Schema} = mongoose;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true,
    },
    lastname: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        unique: true,
        index: true,
        required: true
    },
    password: {
        type: String,
        required: function () {
            return this.provider === AuthProvider.LOCAL;
        }
    },
    googleId: {
        type: String,
        index: true,
        unique: true,
        sparse: true,
        select: false,
    },
    verifiedAt: {
        type: Date,
        default: function () {
            return this.provider !== AuthProvider.LOCAL ? Date.now() : undefined;
        }
    },
    provider: {
        type: String,
        enum: Object.values(AuthProvider),
        default: AuthProvider.LOCAL,
        required: true,
    },
    otpCode: {
        type: String,
        unique: true,
        sparse: true,
        select: false,
    },
    otpCodeExpiresAt: {
        type: Date,
        select: false,
    },
    isVerified: {
        type: Boolean,
        default: function () {
            return this.provider !== AuthProvider.LOCAL;
        }
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

const User = mongoose.model('User', userSchema);

// TTL index: Automatically removes documents when the 'otpCodeExpiresAt' field's value is reached.
// Setting expireAfterSeconds: 0 means that the document expires exactly at the time specified in 'otpCodeExpiresAt'.
userSchema.index({otpCodeExpiresAt: 1}, {expireAfterSeconds: 0});

userSchema.index({email: 1, otpCode: 1, otpCodeExpiresAt: 1});
userSchema.index({email: 1, isVerified: 1, otpCodeExpiresAt: 1});
userSchema.index({email: 1, isVerified: 1});
userSchema.index({_id: 1, isVerified: 1});

// Ensure indexes are created after the connection is open.
mongoose.connection.once('open', () => {
    User.createIndexes().catch((err) => console.error('Error creating User indexes:', err));
});

module.exports = User;
