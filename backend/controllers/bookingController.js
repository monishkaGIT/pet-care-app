const Booking = require('../models/Booking');
const User = require('../models/User');
const Pet = require('../models/Pet');

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

// @desc    Get ALL bookings (admin only)
// @route   GET /api/bookings/admin/all
const getAllBookings = async (req, res) => {
    try {
        const bookings = await Booking.find()
            .sort({ createdAt: -1 });

        // Populate user and pet info manually
        const populated = await Promise.all(
            bookings.map(async (booking) => {
                const bookingObj = booking.toObject();
                try {
                    const user = await User.findById(booking.userId).select('name email');
                    bookingObj.user = user || { name: 'Unknown', email: '' };
                } catch {
                    bookingObj.user = { name: 'Unknown', email: '' };
                }
                try {
                    const pet = await Pet.findById(booking.petId).select('name breed');
                    bookingObj.pet = pet || { name: 'Unknown', breed: '' };
                } catch {
                    bookingObj.pet = { name: 'Unknown', breed: '' };
                }
                return bookingObj;
            })
        );

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Admin update booking status (confirm/complete/cancel)
// @route   PUT /api/bookings/admin/:id/status
const adminUpdateBookingStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['Pending', 'Confirmed', 'Completed', 'Cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true, runValidators: true }
        );

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.json(booking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createBooking,
    getUserBookings,
    getBookingById,
    updateBooking,
    deleteBooking,
    getAllBookings,
    adminUpdateBookingStatus,
};
