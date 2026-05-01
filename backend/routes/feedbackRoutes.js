const express = require('express');
const router = express.Router();
const {
    createFeedback,
    getUserFeedbacks,
    getAllFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
} = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

// Public route (no auth required)
router.get('/public', getAllFeedbacks);

// Protected routes
router.route('/')
    .get(protect, getUserFeedbacks)
    .post(protect, createFeedback);

router.route('/:id')
    .get(protect, getFeedbackById)
    .put(protect, updateFeedback)
    .delete(protect, deleteFeedback);

module.exports = router;
