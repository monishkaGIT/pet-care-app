const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
    {
        // Who should receive this notification
        recipient: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true,
        },
        // Who triggered it (the actor — person who liked / commented)
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null,
        },
        // Discriminator: 'like' | 'comment' | 'health' | 'service'
        type: {
            type: String,
            enum: ['like', 'comment', 'health', 'service'],
            required: true,
        },
        // Human-readable message
        message: {
            type: String,
            required: true,
            trim: true,
        },
        // The post (or health record, booking, etc.) this refers to
        referenceId: {
            type: mongoose.Schema.Types.ObjectId,
            default: null,
        },
        // Read/unread
        read: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
