const mongoose = require('mongoose');
const authProvider = require('../enums/auth.enum');
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
            return this.provider === authProvider.LOCAL;
        }
    },
    avatarPlaceholder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    },
    avatar: {
        type: Schema.Types.ObjectId,
        ref: 'File'
    },
    provider: {
        type: String,
        enum: Object.values(authProvider),
        default: authProvider.LOCAL,
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
        }
    }
});

userSchema.virtual('authProvider', {
    ref: 'AuthProvider',
    localField: '_id',
    foreignField: 'userId',
    justOne: true
});

userSchema.index({avatar: 1}, {
    unique: true,
    partialFilterExpression: {
        avatar: {$type: 'objectId'} // Only enforce uniqueness for ObjectId values
    }
});

userSchema.index({avatarPlaceholder: 1}, {
    unique: true,
    partialFilterExpression: {
        avatar: {$type: 'objectId'} // Only enforce uniqueness for ObjectId values
    }
});

const User = mongoose.model('User', userSchema);

mongoose.connection.once('open', () => {
    User.createIndexes().catch((err) => console.error('Error creating User indexes:', err));
});

module.exports = User;
