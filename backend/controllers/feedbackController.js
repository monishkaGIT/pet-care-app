const Feedback = require('../models/Feedback');

// @desc    Create new feedback
// @route   POST /api/feedbacks
const createFeedback = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const { title, message, category, rating, userName } = req.body;

        if (!title || !message || !rating) {
            res.status(400);
            throw new Error('Title, message, and rating are required');
        }

        const feedback = await Feedback.create({
            userId,
            userName: userName || 'Anonymous',
            title,
            message,
            category: category || 'General',
            rating,
        });

        res.status(201).json(feedback);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get all feedbacks for logged-in user
// @route   GET /api/feedbacks
const getUserFeedbacks = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const feedbacks = await Feedback.find({ userId }).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get single feedback by ID
// @route   GET /api/feedbacks/:id
const getFeedbackById = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const feedback = await Feedback.findOne({ _id: req.params.id, userId });

        if (!feedback) {
            res.status(404);
            throw new Error('Feedback not found');
        }

        res.json(feedback);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Update feedback
// @route   PUT /api/feedbacks/:id
const updateFeedback = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const feedback = await Feedback.findOne({ _id: req.params.id, userId });

        if (!feedback) {
            res.status(404);
            throw new Error('Feedback not found');
        }

        const updatedFeedback = await Feedback.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedFeedback);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Delete feedback
// @route   DELETE /api/feedbacks/:id
const deleteFeedback = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const feedback = await Feedback.findOne({ _id: req.params.id, userId });

        if (!feedback) {
            res.status(404);
            throw new Error('Feedback not found');
        }

        await Feedback.findByIdAndDelete(req.params.id);
        res.json({ message: 'Feedback removed successfully' });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get ALL feedbacks (public, no auth)
// @route   GET /api/feedbacks/public
const getAllFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find({}).sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createFeedback,
    getUserFeedbacks,
    getAllFeedbacks,
    getFeedbackById,
    updateFeedback,
    deleteFeedback,
};
