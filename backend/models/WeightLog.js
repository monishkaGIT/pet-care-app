const mongoose = require("mongoose");

const weightLogSchema = new mongoose.Schema({
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    unit: {
        type: String,
        enum: ["kg", "lbs"],
        default: "kg"
    },
    date: {
        type: Date,
        default: Date.now
    },
    notes: {
        type: String,
        trim: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
weightLogSchema.index({ petId: 1, date: -1 });
weightLogSchema.index({ petId: 1, userId: 1 });

module.exports = mongoose.model("WeightLog", weightLogSchema, "WeightLogs");
