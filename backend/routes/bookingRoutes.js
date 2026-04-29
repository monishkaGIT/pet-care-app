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

// Admin routes (must be before /:id to avoid conflicts)
router.get('/admin/all', getAllBookings);
router.put('/admin/:id/status', adminUpdateBookingStatus);

router.route('/')
    .get(getUserBookings)
    .post(createBooking);

router.route('/:id')
    .get(getBookingById)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;
