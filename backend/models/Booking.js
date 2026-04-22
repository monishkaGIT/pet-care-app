const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    petId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Pet",
        required: true
    },
    serviceType: {
        type: String,
        required: true,
        trim: true
    },
    bookingDate: {
        type: String,
        required: true
    },
    bookingTime: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        trim: true
    },
    status: {
        type: String,
        enum: ["Pending", "Confirmed", "Completed", "Cancelled"],
        default: "Pending"
    }
}, {
    timestamps: true
});

module.exports = mongoose.model("Booking", bookingSchema, "Bookings");
