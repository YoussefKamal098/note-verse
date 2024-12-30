const mongoose = require('mongoose');
const { Schema } = mongoose;

/*
I'll modify this schema to better support multi-session logging and enhanced user activity tracking.
I will add a separate Session schema, relate it with the userId, and enable users to log in from different browsers and
locations seamlessly.
 */

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
        required: true,
    },
    password: {
        type: String,
        required: true
    },
    refreshToken: {
        type: String,
        index: true,
        default: null
    }
}, { timestamps: true,
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
(async () => (await User.ensureIndexes()))();
module.exports = User;