const Booking = require('../models/Booking');

// @desc    Create a new booking
// @route   POST /api/bookings
const createBooking = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const booking = await Booking.create({
            userId,
            petId: req.body.petId,
            serviceType: req.body.serviceType,
            bookingDate: req.body.bookingDate,
            bookingTime: req.body.bookingTime,
            notes: req.body.notes || '',
            status: req.body.status || 'Pending'
        });

        res.status(201).json(booking);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get all bookings for logged-in user
// @route   GET /api/bookings
const getUserBookings = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const bookings = await Booking.find({ userId }).sort({ createdAt: -1 });
        res.json(bookings);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
const getBookingById = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const booking = await Booking.findOne({ _id: req.params.id, userId });

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        res.json(booking);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
const updateBooking = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const booking = await Booking.findOne({ _id: req.params.id, userId });

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        const updatedBooking = await Booking.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedBooking);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Delete a booking
// @route   DELETE /api/bookings/:id
const deleteBooking = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const booking = await Booking.findOne({ _id: req.params.id, userId });

        if (!booking) {
            res.status(404);
            throw new Error('Booking not found');
        }

        await Booking.findByIdAndDelete(req.params.id);
        res.json({ message: 'Booking removed successfully' });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
};
