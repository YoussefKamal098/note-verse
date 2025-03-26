const mongoose = require('mongoose');
const {Schema} = mongoose;

const googleAuthSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
        unique: true
    },
    googleId: {
        type: String,
        required: true,
        index: true,
        unique: true
    },
    avatarUrl: {
        type: String,
        required: false
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

const GoogleAuth = mongoose.model('GoogleAuth', googleAuthSchema);

// Ensure indexes are created after the connection is open.
mongoose.connection.once('open', () => {
    GoogleAuth.createIndexes().catch((err) => console.error('Error creating GoogleAuth indexes:', err));
});

module.exports = GoogleAuth;
