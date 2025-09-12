const mongoose = require('mongoose');
const notificationType = require('../enums/notifications.enum');

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        index: true
    },
    type: {
        type: String,
        enum: Object.values(notificationType),
        index: true
    },
    payload: mongoose.Schema.Types.Mixed,
    read: {type: Boolean, default: false, index: true},
    seen: {type: Boolean, default: false, index: true}
}, {
    timestamps: true
});

// TTL index on `createdAt` for automatic deletion after 30 days
notificationSchema.index({createdAt: 1}, {expires: '30d'});
// Compound indexes
notificationSchema.index({recipient: 1, seen: 1});
notificationSchema.index({recipient: 1, read: 1, createdAt: -1});
notificationSchema.index({recipient: 1, createdAt: -1});

const Notification = mongoose.model('Notification', notificationSchema);

mongoose.connection.once('open', () => {
    Notification.createIndexes().catch((err) => console.error('Error creating Notification indexes:', err));
});

module.exports = Notification;
