const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: { type: String, required: true, trim: true },
    type: { type: String, required: true, enum: ['dog', 'cat', 'rabbit', 'bird', 'fish', 'other'] },
    breed: { type: String, default: '' },
    age: { type: Number, default: 0 },
    weight: { type: Number, default: 0 },
    gender: { type: String, enum: ['male', 'female', 'unknown'], default: 'unknown' },
    color: { type: String, default: '' },
    neutered: { type: Boolean, default: false },
    microchipped: { type: Boolean, default: false },
    vaccinated: { type: Boolean, default: false },
    profileImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Pet', petSchema);
