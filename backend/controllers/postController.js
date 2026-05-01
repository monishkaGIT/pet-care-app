const Post = require('../models/Post');
const Notification = require('../models/Notification');

// ─────────────────────────────────────────────────────────────
// @desc   Get all posts (main feed) — populated with author & pet
// @route  GET /api/posts
// @access Private
// ─────────────────────────────────────────────────────────────
const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', 'name profileImage')
            .populate('pet', 'name type breed profileImage');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching posts' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get only the logged-in user's posts (profile grid)
// @route  GET /api/posts/mine
// @access Private
// ─────────────────────────────────────────────────────────────
const getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .sort({ createdAt: -1 })
            .populate('pet', 'name type breed profileImage');
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching your posts' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Get a single post by ID
// @route  GET /api/posts/:id
// @access Private
// ─────────────────────────────────────────────────────────────
const getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'name profileImage')
            .populate('pet', 'name type breed profileImage')
            .populate('comments.author', 'name profileImage');
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching post' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Create a new post
// @route  POST /api/posts
// @access Private
// ─────────────────────────────────────────────────────────────
const createPost = async (req, res) => {
    try {
        const { caption, image, pet, label } = req.body;

        if (!caption) return res.status(400).json({ message: 'Caption is required' });

        // TODO: image should be the Cloudinary secure_url uploaded from the mobile app
        // e.g. 'https://res.cloudinary.com/your-cloud/image/upload/v.../filename.jpg'
        const post = await Post.create({
            author: req.user._id,   // mirrors: owner: req.user._id in petController
            caption,
            image: image || '',
            pet: pet || null,
            label: label || '',
            likes: [],
            comments: [],
        });

        // Return the post populated so the feed can render immediately
        const populated = await post.populate([
            { path: 'author', select: 'name profileImage' },
            { path: 'pet', select: 'name type breed profileImage' },
        ]);

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating post' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Update a post (owner only)
// @route  PUT /api/posts/:id
// @access Private — mirrors updatePet pattern
// ─────────────────────────────────────────────────────────────
const updatePost = async (req, res) => {
    try {
        // findOne with author check — same as Pet.findOne({ _id, owner })
        const post = await Post.findOne({ _id: req.params.id, author: req.user._id });
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const fields = ['caption', 'image', 'pet', 'label'];
        fields.forEach(f => { if (req.body[f] !== undefined) post[f] = req.body[f]; });

        const updated = await post.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating post' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Delete a post (owner only)
// @route  DELETE /api/posts/:id
// @access Private — mirrors deletePet pattern exactly
// ─────────────────────────────────────────────────────────────
const deletePost = async (req, res) => {
    try {
        const post = await Post.findOneAndDelete({ _id: req.params.id, author: req.user._id });
        if (!post) return res.status(404).json({ message: 'Post not found' });
        res.json({ message: 'Post deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting post' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Toggle like on a post
// @route  PUT /api/posts/:id/like
// @access Private
// ─────────────────────────────────────────────────────────────
const toggleLike = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user._id.toString();
        const alreadyLiked = post.likes.some(id => id.toString() === userId);

        if (alreadyLiked) {
            post.likes = post.likes.filter(id => id.toString() !== userId);
        } else {
            post.likes.push(req.user._id);
            // Create notification only when liking (not unliking) someone else's post
            if (post.author.toString() !== userId) {
                await Notification.create({
                    recipient: post.author,
                    sender: req.user._id,
                    type: 'like',
                    message: `${req.user.name} liked your post.`,
                    referenceId: post._id,
                });
            }
        }

        await post.save();
        res.json({ likes: post.likes, liked: !alreadyLiked });
    } catch (error) {
        res.status(500).json({ message: 'Server error toggling like' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Add a comment to a post
// @route  POST /api/posts/:id/comments
// @access Private
// ─────────────────────────────────────────────────────────────
const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({ author: req.user._id, text });
        await post.save();

        // Notify the post author when someone else comments
        if (post.author.toString() !== req.user._id.toString()) {
            await Notification.create({
                recipient: post.author,
                sender: req.user._id,
                type: 'comment',
                message: `${req.user.name} commented: "${text.slice(0, 60)}${text.length > 60 ? '…' : ''}"`,
                referenceId: post._id,
            });
        }

        // Re-fetch to populate comment authors
        const updated = await Post.findById(req.params.id)
            .populate('comments.author', 'name profileImage');
        res.status(201).json(updated.comments);
    } catch (error) {
        res.status(500).json({ message: 'Server error adding comment' });
    }
};

// ─────────────────────────────────────────────────────────────
// @desc   Delete a comment
// @route  DELETE /api/posts/:id/comments/:commentId
// @access Private
// ─────────────────────────────────────────────────────────────
const deleteComment = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const comment = post.comments.id(req.params.commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found' });

        // Ensure user is comment author or post author
        if (comment.author.toString() !== req.user._id.toString() && post.author.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Not authorized to delete this comment' });
        }

        // Mongoose subdocument removal
        post.comments.pull({ _id: req.params.commentId });
        await post.save();

        res.json({ message: 'Comment removed successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting comment' });
    }
};

module.exports = {
    getAllPosts,
    getMyPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    toggleLike,
    addComment,
    deleteComment,
};
