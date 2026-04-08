const mongoose = require("mongoose");

const serviceSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Service name is required"],
            minlength: [3, "Service name must be at least 3 characters"],
            maxlength: [100, "Service name cannot exceed 100 characters"],
            trim: true,
        },
        category: {
            type: String,
            required: [true, "Category is required"],
            enum: {
                values: ["Grooming", "Boarding", "Medical Care", "Training", "Walking"],
                message: "Category must be one of: Grooming, Boarding, Medical Care, Training, Walking",
            },
        },
        description: {
            type: String,
            required: [true, "Description is required"],
            minlength: [10, "Description must be at least 10 characters"],
            maxlength: [1000, "Description cannot exceed 1000 characters"],
            trim: true,
        },
        price: {
            type: Number,
            required: [true, "Price is required"],
            min: [0, "Price cannot be negative"],
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        imageUrl: {
            type: String,
            required: [true, "Service image is required"],
        },
        imagePublicId: {
            type: String,
            // Cloudinary public_id — needed for deletion
        },
        icon: {
            type: String,
            default: "pets",
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Service", serviceSchema);
