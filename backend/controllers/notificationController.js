const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @desc   Get all notifications for the logged-in user
// @route  GET /api/notifications
// @access Private
// ─────────────────────────────────────────────────────────────
const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(100)
            .populate('sender', 'name profileImage');

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching notifications' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Mark all notifications as read for the logged-in user
// @route  PUT /api/notifications/mark-read
// @access Private
// ─────────────────────────────────────────────────────────────
const markAllRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, read: false },
            { $set: { read: true } }
        );
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Server error marking notifications read' });
    }
};

module.exports = { getNotifications, markAllRead };
