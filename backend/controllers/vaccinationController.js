const Vaccination = require('../models/Vaccination');
const Pet = require('../models/Pet');
const Notification = require('../models/Notification');

// @desc    Get all vaccinations for a pet (vaccination passport)
// @route   GET /api/pets/:petId/health/vaccinations
const getVaccinations = async (req, res) => {
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

        const vaccinations = await Vaccination.find({ petId, userId })
            .sort({ administeredDate: -1 });

        res.json(vaccinations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a new vaccination record
// @route   POST /api/pets/:petId/health/vaccinations
const createVaccination = async (req, res) => {
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

        const vaccination = await Vaccination.create({
            petId,
            userId,
            vaccineName: req.body.vaccineName,
            lotNumber: req.body.lotNumber || '',
            administeredDate: req.body.administeredDate,
            nextDueDate: req.body.nextDueDate || null,
            administeredBy: req.body.administeredBy || '',
            clinicName: req.body.clinicName || '',
            notes: req.body.notes || '',
        });

        // Notify user: vaccination logged + optional next-due reminder
        let message = `Vaccination "${req.body.vaccineName}" logged for ${pet.name}.`;
        if (req.body.nextDueDate) {
            const due = new Date(req.body.nextDueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            message += ` Next dose due on ${due}.`;
        }
        await Notification.create({
            recipient: userId,
            type: 'health',
            message,
            referenceId: vaccination._id,
        });

        res.status(201).json(vaccination);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a vaccination record
// @route   PUT /api/pets/:petId/health/vaccinations/:vacId
const updateVaccination = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, vacId } = req.params;

        const vaccination = await Vaccination.findOne({
            _id: vacId, petId, userId
        });

        if (!vaccination) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        const updatedVaccination = await Vaccination.findByIdAndUpdate(
            vacId,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedVaccination);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a vaccination record
// @route   DELETE /api/pets/:petId/health/vaccinations/:vacId
const deleteVaccination = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            return res.status(401).json({ message: 'Not authorized - no user ID' });
        }

        const { petId, vacId } = req.params;

        const vaccination = await Vaccination.findOne({
            _id: vacId, petId, userId
        });

        if (!vaccination) {
            return res.status(404).json({ message: 'Vaccination record not found' });
        }

        await Vaccination.findByIdAndDelete(vacId);
        res.json({ message: 'Vaccination record removed successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,
};
