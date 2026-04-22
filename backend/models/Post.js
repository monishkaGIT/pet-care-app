const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true, trim: true },
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    // Author — mirrors Pet.js pattern (owner → author)
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    // Optional pet tag — reference to user's pet
    pet: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Pet',
        default: null,
    },
    caption: {
        type: String,
        required: true,
        trim: true,
    },
    // TODO: Replace this with your Cloudinary URL after upload
    // Store the Cloudinary secure_url here, e.g. 'https://res.cloudinary.com/...'
    image: {
        type: String,
        default: '',
    },
    // A short label/vibe tag shown as a badge on the post image
    label: {
        type: String,
        default: '',
        trim: true,
    },
    // Likes: array of User IDs who liked this post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Embedded comments
    comments: [commentSchema],
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);
