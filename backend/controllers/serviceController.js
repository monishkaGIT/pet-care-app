const Service = require("../models/Service");
const cloudinary = require("../config/cloudinary");
const { validateObjectId, validateServiceInput } = require("../middleware/validateRequest");

/**
 * Helper: upload a file buffer to Cloudinary
 */
const uploadToCloudinary = (fileBuffer, folder = "petcare/services") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder,
                resource_type: "image",
                transformation: [
                    { width: 800, height: 600, crop: "limit" },
                    { quality: "auto" },
                    { fetch_format: "auto" },
                ],
            },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        stream.end(fileBuffer);
    });
};

/**
 * Helper: delete an image from Cloudinary
 */
const deleteFromCloudinary = async (publicId) => {
    if (publicId) {
        try {
            await cloudinary.uploader.destroy(publicId);
        } catch (error) {
            console.error("Cloudinary deletion error:", error.message);
        }
    }
};

// ── GET /api/services — Get all services (protected) ───────────────
exports.getAllServices = async (req, res) => {
    try {
        const services = await Service.find({})
            .populate("createdBy", "name email")
            .sort({ createdAt: -1 });
        res.json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── GET /api/services/stats — Get service stats (admin) ────────────
exports.getServiceStats = async (req, res) => {
    try {
        const totalServices = await Service.countDocuments();
        const activeServices = await Service.countDocuments({ isActive: true });
        const inactiveServices = await Service.countDocuments({ isActive: false });

        // Count by category
        const categoryCounts = await Service.aggregate([
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);

        res.json({
            totalServices,
            activeServices,
            inactiveServices,
            categoryCounts,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── GET /api/services/:id — Get a single service (protected) ───────
exports.getServiceById = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid service ID format" });
        }

        const service = await Service.findById(req.params.id).populate("createdBy", "name email");

        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        res.json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// ── POST /api/services — Create a new service (admin) ──────────────
exports.createService = async (req, res) => {
    try {
        // Ensure body exists (can be undefined when Content-Type isn't multipart)
        if (!req.body) req.body = {};

        // Validate input fields
        const errors = validateServiceInput(req.body);

        // Validate image file
        if (!req.file) {
            errors.push({ field: "image", message: "Service image is required" });
        }

        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        // Check for duplicate name
        const existingService = await Service.findOne({
            name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
        });
        if (existingService) {
            return res.status(400).json({ message: "A service with this name already exists" });
        }

        // Upload image to Cloudinary
        const cloudinaryResult = await uploadToCloudinary(req.file.buffer);

        const service = await Service.create({
            name: req.body.name.trim(),
            category: req.body.category,
            description: req.body.description.trim(),
            price: parseFloat(req.body.price),
            isActive: req.body.isActive !== undefined ? req.body.isActive === "true" || req.body.isActive === true : true,
            imageUrl: cloudinaryResult.secure_url,
            imagePublicId: cloudinaryResult.public_id,
            icon: req.body.icon || "pets",
            createdBy: req.user._id,
        });

        const populated = await Service.findById(service._id).populate("createdBy", "name email");
        res.status(201).json(populated);
    } catch (error) {
        // Handle Mongoose validation errors
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ message: "Validation failed", errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── PUT /api/services/:id — Update a service (admin) ───────────────
exports.updateService = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid service ID format" });
        }

        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Validate input (partial update allowed)
        const errors = validateServiceInput(req.body, true);
        if (errors.length > 0) {
            return res.status(400).json({ message: "Validation failed", errors });
        }

        // Check for duplicate name (excluding current service)
        if (req.body.name) {
            const existingService = await Service.findOne({
                name: { $regex: new RegExp(`^${req.body.name.trim()}$`, "i") },
                _id: { $ne: req.params.id },
            });
            if (existingService) {
                return res.status(400).json({ message: "A service with this name already exists" });
            }
        }

        // Handle image changes
        if (req.file) {
            // New image uploaded — replace the old one
            await deleteFromCloudinary(service.imagePublicId);

            const cloudinaryResult = await uploadToCloudinary(req.file.buffer);
            service.imageUrl = cloudinaryResult.secure_url;
            service.imagePublicId = cloudinaryResult.public_id;
        } else if (req.body.removeImage === "true") {
            // User explicitly removed the image without uploading a new one
            await deleteFromCloudinary(service.imagePublicId);
            service.imageUrl = "";
            service.imagePublicId = "";
        }

        // Update fields
        if (req.body.name !== undefined) service.name = req.body.name.trim();
        if (req.body.category !== undefined) service.category = req.body.category;
        if (req.body.description !== undefined) service.description = req.body.description.trim();
        if (req.body.price !== undefined) service.price = parseFloat(req.body.price);
        if (req.body.isActive !== undefined) service.isActive = req.body.isActive === "true" || req.body.isActive === true;
        if (req.body.icon !== undefined) service.icon = req.body.icon;

        const updatedService = await service.save();
        const populated = await Service.findById(updatedService._id).populate("createdBy", "name email");

        res.json(populated);
    } catch (error) {
        if (error.name === "ValidationError") {
            const errors = Object.values(error.errors).map((err) => ({
                field: err.path,
                message: err.message,
            }));
            return res.status(400).json({ message: "Validation failed", errors });
        }
        res.status(500).json({ message: error.message });
    }
};

// ── DELETE /api/services/:id — Delete a service (admin) ────────────
exports.deleteService = async (req, res) => {
    try {
        if (!validateObjectId(req.params.id)) {
            return res.status(400).json({ message: "Invalid service ID format" });
        }

        const service = await Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Delete image from Cloudinary
        await deleteFromCloudinary(service.imagePublicId);

        // Delete from DB
        await Service.deleteOne({ _id: service._id });

        res.json({ message: "Service deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
