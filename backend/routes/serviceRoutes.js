const express = require("express");
const router = express.Router();
const {
    getAllServices,
    getServiceById,
    createService,
    updateService,
    deleteService,
    getServiceStats,
} = require("../controllers/serviceController");
const { protect, admin } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// Protected routes (any logged-in user)
router.get("/", protect, getAllServices);

// Admin-only stats route — must be ABOVE /:id so "stats" isn't treated as an id
router.get("/stats", protect, admin, getServiceStats);

// Protected route — single service
router.get("/:id", protect, getServiceById);

// Admin-only CRUD routes with Multer image upload
router.post("/", protect, admin, upload.single("image"), createService);
router.put("/:id", protect, admin, upload.single("image"), updateService);
router.delete("/:id", protect, admin, deleteService);

module.exports = router;
