const mongoose = require("mongoose");

const petSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    breed: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        trim: true
    },
    profileImage: {
        type: String,
        trim: true
    },
    age: {
        type: Number,
        default: 0
    },
    weight: {
        type: Number,
        default: 0
    },
    gender: {
        type: String,
        enum: ["Male", "Female"],
        default: "Male"
    },
    color: {
        type: String,
        trim: true
    },
    isNeutered: {
        type: Boolean,
        default: false
    },
    isMicrochipped: {
        type: Boolean,
        default: false
    },
    microchipNumber: {
        type: String,
        trim: true
    },
    isVaccinated: {
        type: Boolean,
        default: false
    },
    insurance: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Pet", petSchema, "MyPets");
