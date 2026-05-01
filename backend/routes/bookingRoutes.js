const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getAllBookings,
    adminUpdateBookingStatus,
} = require('../controllers/bookingController');
const { protect, admin } = require('../middleware/authMiddleware');

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/all', protect, admin, getAllBookings);
router.put('/admin/:id/status', protect, admin, adminUpdateBookingStatus);

router.route('/')
    .get(protect, getUserBookings)
    .post(protect, createBooking);

router.route('/:id')
    .get(protect, getBookingById)
    .put(protect, updateBooking)
    .delete(protect, deleteBooking);

module.exports = router;
