const HealthRecord = require('../models/HealthRecord');
const WeightLog = require('../models/WeightLog');
const Vaccination = require('../models/Vaccination');
const Pet = require('../models/Pet');

// @desc    Get health summary (quick stats) for a pet
// @route   GET /api/pets/:petId/health/summary
const getHealthSummary = async (req, res) => {
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

        // Get latest weight log
        const latestWeight = await WeightLog.findOne({ petId, userId })
            .sort({ date: -1 })
            .limit(1);

        // Get previous weight log for comparison
        const previousWeight = await WeightLog.findOne({ petId, userId })
            .sort({ date: -1 })
            .skip(1)
            .limit(1);

        // Get last checkup (most recent health record)
        const lastCheckup = await HealthRecord.findOne({ petId, userId })
            .sort({ visitDate: -1 })
            .limit(1);

        // Get active health records count
        const activeRecordsCount = await HealthRecord.countDocuments({
            petId, userId, status: 'active'
        });

        // Get upcoming vaccinations
        const upcomingVaccinations = await Vaccination.countDocuments({
            petId, userId,
            nextDueDate: { $gte: new Date() }
        });

        // Calculate weight change
        let weightChange = null;
        if (latestWeight && previousWeight) {
            weightChange = +(latestWeight.weight - previousWeight.weight).toFixed(1);
        }

        res.json({
            currentWeight: latestWeight ? latestWeight.weight : pet.weight || 0,
            weightUnit: latestWeight ? latestWeight.unit : 'kg',
            weightChange,
            lastCheckup: lastCheckup ? {
                date: lastCheckup.visitDate,
                title: lastCheckup.title,
            } : null,
            activeRecordsCount,
            upcomingVaccinations,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all health records for a pet
// @route   GET /api/pets/:petId/health/records
const getHealthRecords = async (req, res) => {
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

        const records = await HealthRecord.find({ petId, userId })
            .sort({ visitDate: -1 });

        res.json(records);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single health record by ID
// @route   GET /api/pets/:petId/health/records/:recordId
const getHealthRecordById = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, recordId } = req.params;

        const record = await HealthRecord.findOne({
            _id: recordId, petId, userId
        });

        if (!record) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        res.json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new health record
// @route   POST /api/pets/:petId/health/records
const createHealthRecord = async (req, res) => {
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

        const record = await HealthRecord.create({
            petId,
            userId,
            recordType: req.body.recordType || 'medical',
            title: req.body.title,
            status: req.body.status || 'active',
            visitDate: req.body.visitDate || Date.now(),
            clinicName: req.body.clinicName || '',
            vetName: req.body.vetName || '',
            vetTitle: req.body.vetTitle || '',
            diagnosis: req.body.diagnosis || '',
            treatment: req.body.treatment || [],
            medicines: req.body.medicines || [],
            notes: req.body.notes || '',
        });

        res.status(201).json(record);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a health record
// @route   PUT /api/pets/:petId/health/records/:recordId
const updateHealthRecord = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, recordId } = req.params;

        const record = await HealthRecord.findOne({
            _id: recordId, petId, userId
        });

        if (!record) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        const updatedRecord = await HealthRecord.findByIdAndUpdate(
            recordId,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedRecord);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a health record
// @route   DELETE /api/pets/:petId/health/records/:recordId
const deleteHealthRecord = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, recordId } = req.params;

        const record = await HealthRecord.findOne({
            _id: recordId, petId, userId
        });

        if (!record) {
            return res.status(404).json({ message: 'Health record not found' });
        }

        await HealthRecord.findByIdAndDelete(recordId);
        res.json({ message: 'Health record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getHealthSummary,
    getHealthRecords,
    getHealthRecordById,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
};
