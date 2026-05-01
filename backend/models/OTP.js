const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    otp: {
        type: String,
        required: true
    },
    userData: {
        type: Object,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 600 // expires in 10 minutes (600 seconds)
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("OTP", otpSchema);
