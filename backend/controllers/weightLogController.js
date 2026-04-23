const WeightLog = require('../models/WeightLog');
const Pet = require('../models/Pet');

// @desc    Get weight history for a pet
// @route   GET /api/pets/:petId/health/weight
const getWeightHistory = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId } = req.params;

        // Verify pet belongs to user
        const pet = await Pet.findOne({ _id: petId, userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        const weightLogs = await WeightLog.find({ petId, userId })
            .sort({ date: -1 });

        res.json(weightLogs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Add a weight entry
// @route   POST /api/pets/:petId/health/weight
const addWeightEntry = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId } = req.params;

        // Verify pet belongs to user
        const pet = await Pet.findOne({ _id: petId, userId });
        if (!pet) {
            return res.status(404).json({ message: 'Pet not found' });
        }

        const weightLog = await WeightLog.create({
            petId,
            userId,
            weight: req.body.weight,
            unit: req.body.unit || 'kg',
            date: req.body.date || Date.now(),
            notes: req.body.notes || '',
        });

        // Also update the pet's weight field with latest value
        await Pet.findByIdAndUpdate(petId, { weight: req.body.weight });

        res.status(201).json(weightLog);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a weight entry
// @route   DELETE /api/pets/:petId/health/weight/:logId
const deleteWeightEntry = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, logId } = req.params;

        const weightLog = await WeightLog.findOne({
            _id: logId, petId, userId
        });

        if (!weightLog) {
            return res.status(404).json({ message: 'Weight log not found' });
        }

        await WeightLog.findByIdAndDelete(logId);

        // Update pet's weight to the next most recent entry
        const latestWeight = await WeightLog.findOne({ petId, userId })
            .sort({ date: -1 });
        if (latestWeight) {
            await Pet.findByIdAndUpdate(petId, { weight: latestWeight.weight });
        }

        res.json({ message: 'Weight log removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getWeightHistory,
    addWeightEntry,
    deleteWeightEntry,
};
