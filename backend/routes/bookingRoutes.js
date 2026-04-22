const express = require('express');
const router = express.Router();
const {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
} = require('../controllers/bookingController');

router.route('/')
    .get(getUserBookings)
    .post(createBooking);

router.route('/:id')
    .get(getBookingById)
    .put(updateBooking)
    .delete(deleteBooking);

module.exports = router;
