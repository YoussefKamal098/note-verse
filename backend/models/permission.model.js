const mongoose = require('mongoose');
const resources = require('../enums/resources.enum');
const roles = require('../enums/roles.enum');

const {Schema} = mongoose;

const permissionSchema = new Schema({
    resourceType: {
        type: String,
        required: true,
        enum: Object.values(resources)
    },
    resourceId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    role: {
        type: String,
        enum: Object.values(roles),
        required: true
    },
    grantedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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

permissionSchema.index({resourceId: 1, resourceType: 1, userId: 1, grantedBy: 1});
permissionSchema.index({userId: 1, resourceType: 1});
permissionSchema.index(
    {resourceId: 1, resourceType: 1, userId: 1},
    {unique: true, name: 'unique_permission'}
);
permissionSchema.index({grantedBy: 1, resourceType: 1, updatedAt: -1, createdAt: -1});

const Permission = mongoose.model('Permission', permissionSchema);

mongoose.connection.once('open', () => {
    Permission.createIndexes().catch((err) => console.error('Error creating Permission indexes:', err));
});

module.exports = Permission;
