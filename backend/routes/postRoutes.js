const express = require('express');
const router = express.Router();
const {
    getAllPosts,
    getMyPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
} = require('../controllers/postController');
const { protect } = require('../middleware/authMiddleware');

// Main feed + create
router.route('/')
    .get(protect, getAllPosts)
    .post(protect, createPost);

// Current user's own posts (profile grid)
router.route('/mine')
    .get(protect, getMyPosts);

// Single post CRUD
router.route('/:id')
    .get(protect, getPostById)
    .put(protect, updatePost)
    .delete(protect, deletePost);

// Like toggle
router.route('/:id/like')
    .put(protect, toggleLike);

// Comments
router.route('/:id/comments')
    .post(protect, addComment);

router.route('/:id/comments/:commentId')
    .delete(protect, deleteComment);

module.exports = router;
