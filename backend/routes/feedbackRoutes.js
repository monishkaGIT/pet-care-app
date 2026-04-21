const express = require('express');
const router = express.Router();
const {
    createFeedback,
    getUserFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
} = require('../controllers/feedbackController');

router.route('/')
    .get(getUserFeedbacks)
    .post(createFeedback);

router.route('/:id')
    .get(getFeedbackById)
    .put(updateFeedback)
    .delete(deleteFeedback);

module.exports = router;
