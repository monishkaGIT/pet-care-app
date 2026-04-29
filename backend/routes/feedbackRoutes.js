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

// Public route (no auth required)
router.get('/public', getAllFeedbacks);

router.route('/')
    .get(getUserFeedbacks)
    .post(createFeedback);

router.route('/:id')
    .get(getFeedbackById)
    .put(updateFeedback)
    .delete(deleteFeedback);

module.exports = router;
