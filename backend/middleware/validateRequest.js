const mongoose = require("mongoose");

/**
 * Validate that a string is a valid MongoDB ObjectId
 */
const validateObjectId = (id) => {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validate service input fields — returns an array of error objects
 * Each error: { field: string, message: string }
 */
const validateServiceInput = (body, isUpdate = false) => {
    const errors = [];

    // Name
    if (!isUpdate || body.name !== undefined) {
        if (!body.name || !body.name.trim()) {
            errors.push({ field: "name", message: "Service name is required" });
        } else if (body.name.trim().length < 3) {
            errors.push({ field: "name", message: "Service name must be at least 3 characters" });
        } else if (body.name.trim().length > 100) {
            errors.push({ field: "name", message: "Service name cannot exceed 100 characters" });
        }
    }

    // Category
    const validCategories = ["Grooming", "Boarding", "Medical Care", "Training", "Walking"];
    if (!isUpdate || body.category !== undefined) {
        if (!body.category) {
            errors.push({ field: "category", message: "Category is required" });
        } else if (!validCategories.includes(body.category)) {
            errors.push({
                field: "category",
                message: `Category must be one of: ${validCategories.join(", ")}`,
            });
        }
    }

    // Description
    if (!isUpdate || body.description !== undefined) {
        if (!body.description || !body.description.trim()) {
            errors.push({ field: "description", message: "Description is required" });
        } else if (body.description.trim().length < 10) {
            errors.push({ field: "description", message: "Description must be at least 10 characters" });
        } else if (body.description.trim().length > 1000) {
            errors.push({ field: "description", message: "Description cannot exceed 1000 characters" });
        }
    }

    // Price
    if (!isUpdate || body.price !== undefined) {
        const price = parseFloat(body.price);
        if (body.price === undefined || body.price === null || body.price === "") {
            errors.push({ field: "price", message: "Price is required" });
        } else if (isNaN(price)) {
            errors.push({ field: "price", message: "Price must be a valid number" });
        } else if (price < 0) {
            errors.push({ field: "price", message: "Price cannot be negative" });
        }
    }

    return errors;
};

module.exports = { validateObjectId, validateServiceInput };
