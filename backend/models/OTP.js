const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    purpose: {
        type: String,
        enum: ["registration", "password-reset"],
        default: "registration"
    },
    otp: {
        type: String,
        required: true
    },
    userData: {
        type: Object,
        default: null
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
