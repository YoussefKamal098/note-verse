const mongoose = require('mongoose');
const {Schema} = mongoose;
const {parseTime} = require('shared-utils/date.utils');

/**
 * Mongoose schema for a user session.
 *
 * Stores information about a user's login session including IP, raw User-Agent,
 * and normalized data for browser, operating system, and device type. Using normalized
 * values (ignoring minor version changes) helps maintain session continuity even if the
 * user upgrades their browser or OS.
 *
 * A session is considered active if its expiredAt timestamp is in the future.
 */
const sessionSchema = new Schema(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        ip: {
            type: String,
            required: true,
        },
        userAgent: {
            type: String,
            required: true,
        },
        // Normalized browser information (e.g., "Firefox" without version details)
        normalizedBrowser: {
            type: String,
            default: 'Unknown'
        },
        // Normalized operating system information (e.g., "Ubuntu" or "Windows")
        normalizedOS: {
            type: String,
            default: 'Unknown'
        },
        // Device model information (if available)
        deviceModel: {
            type: String,
            default: 'Unknown'
        },
        // Device type (e.g., "Desktop", "Mobile"); often more stable than model details
        deviceType: {
            type: String,
            default: 'Desktop'
        },
        ipVersion: {
            type: String,
            default: 'unknown',
        },
        // The expiration time. A session is active if expiredAt > current time.
        expiredAt: {
            type: Date,
            required: true,
            index: true,
            default: () => parseTime("30d") // 30 days from now
        },
        // Timestamp of the last access to this session.
        lastAccessedAt: {
            type: Date,
            default: Date.now,
        }
    },
    {
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
    }
);

// Compound index to ensure that each user can have only one session per combination of IP,
// normalized browser, normalized OS, and device type. This helps maintain session continuity
// even if the browser or OS version changes.
sessionSchema.index({userId: 1, ip: 1, normalizedBrowser: 1, normalizedOS: 1, deviceType: 1}, {unique: true});

// Additional compound index to optimize queries that filter by userId, ip, normalized browser,
// normalized OS, device type, and expiredAt.
sessionSchema.index({userId: 1, ip: 1, normalizedBrowser: 1, normalizedOS: 1, deviceType: 1, expiredAt: 1});

const Session = mongoose.model('Session', sessionSchema);
(async () => {
    try {
        await Session.ensureIndexes();
    } catch (err) {
        console.error('Error ensuring Session Schema indexes:', err);
    }
})();

module.exports = Session;
