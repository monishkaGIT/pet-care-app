const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getNotifications, markAllRead } = require('../controllers/notificationController');

router.get('/', protect, getNotifications);
router.put('/mark-read', protect, markAllRead);

module.exports = router;
