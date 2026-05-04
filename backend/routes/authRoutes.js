const express = require("express");
const router = express.Router();
const { 
    registerUser, loginUser, getUserProfile, updateUserProfile, changePassword,
    deleteOwnAccount,
    getUsers, createUser, updateUser, deleteUser 
} = require("../controllers/authController");
const { protect, admin } = require("../middleware/authMiddleware");

// Public routes
router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected User routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, updateUserProfile);
router.put("/password", protect, changePassword);

// Protected Self-Deletion route (simple, no OTP)
router.delete("/me", protect, deleteOwnAccount);

// Protected Admin routes
router.get("/", protect, admin, getUsers);
router.post("/", protect, admin, createUser);
router.put("/:id", protect, admin, updateUser);
router.delete("/:id", protect, admin, deleteUser);

module.exports = router;
