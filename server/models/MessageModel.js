const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 2000
    },
    seen: {
        type: Boolean,
        default: false
    },
    seenAt: {
        type: Date,
        default: null
    }
    ,
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'audio', 'video'],
        default: 'text'
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    edited: {
        type: Boolean,
        default: false
    },
    editedAt: {
        type: Date
    },
    deliveredTo: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    replyTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Message'
    },
    attachments: [{
        filename: String,
        originalName: String,
        mimetype: String,
        size: Number,
        url: String
    }],
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: {
        type: Date
    }

}, {
    timestamps: true
});

// Indexes
messageSchema.index({ conversationId: 1, timestamp: -1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ timestamp: -1 });

// Methods
messageSchema.methods.isReadBy = function (userId) {
    return this.readBy.some(read => read.userId.toString() === userId.toString());
};

messageSchema.methods.isDeliveredTo = function (userId) {
    return this.deliveredTo.some(id => id.toString() === userId.toString());
};

messageSchema.methods.markAsRead = function (userId) {
    if (!this.isReadBy(userId)) {
        this.readBy.push({
            userId,
            readAt: new Date()
        });
        return this.save();
    }
    return Promise.resolve(this);
};

messageSchema.methods.markAsDelivered = function (userId) {
    if (!this.isDeliveredTo(userId)) {
        this.deliveredTo.push(userId);
        return this.save();
    }
    return Promise.resolve(this);
};

// Statics
messageSchema.statics.getUnreadCount = function (conversationId, userId) {
    return this.countDocuments({
        conversationId,
        senderId: { $ne: userId },
        'readBy.userId': { $ne: userId },
        deleted: false
    });
};

messageSchema.statics.markAllAsRead = function (conversationId, userId) {
    const readAtTime = new Date();

    return this.updateMany(
        {
            conversationId,
            senderId: { $ne: userId },
            'readBy.userId': { $ne: userId },
            deleted: false
        },
        {
            $set: {
                seen: true,
                seenAt: readAtTime
            },
            $push: {
                readBy: {
                    userId,
                    readAt: readAtTime
                }
            }
        }
    );
};

// Pre-save middleware to set edit time
messageSchema.pre('save', function (next) {
    if (this.isModified('content') && !this.isNew) {
        this.edited = true;
        this.editedAt = new Date();
    }
    next();
});

// Soft delete
messageSchema.methods.softDelete = function () {
    this.deleted = true;
    this.deletedAt = new Date();
    this.content = 'This message was deleted';
    return this.save();
};

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;