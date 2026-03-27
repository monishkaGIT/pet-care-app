const Pet = require('../models/Pet');

// @desc    Create a new pet
// @route   POST /api/pets
const createPet = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const pet = await Pet.create({
            userId,
            name: req.body.name,
            breed: req.body.breed,
            age: req.body.age || 0,
            weight: req.body.weight || 0,
            gender: req.body.gender || 'Male',
            color: req.body.color || '',
            isNeutered: req.body.isNeutered || false,
            isMicrochipped: req.body.isMicrochipped || false,
            microchipNumber: req.body.microchipNumber || '',
            isVaccinated: req.body.isVaccinated || false,
            insurance: req.body.insurance || '',
        });

        res.status(201).json(pet);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get all pets for logged-in user
// @route   GET /api/pets
const getUserPets = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const pets = await Pet.find({ userId }).sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Get single pet by ID
// @route   GET /api/pets/:id
const getPetById = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const pet = await Pet.findOne({ _id: req.params.id, userId });

        if (!pet) {
            res.status(404);
            throw new Error('Pet not found');
        }

        res.json(pet);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Update a pet
// @route   PUT /api/pets/:id
const updatePet = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const pet = await Pet.findOne({ _id: req.params.id, userId });

        if (!pet) {
            res.status(404);
            throw new Error('Pet not found');
        }

        const updatedPet = await Pet.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedPet);
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

// @desc    Delete a pet
// @route   DELETE /api/pets/:id
const deletePet = async (req, res) => {
    try {
        const userId = req.headers['x-user-id'];
        if (!userId) {
            res.status(401);
            throw new Error('Not authorized - no user ID');
        }

        const pet = await Pet.findOne({ _id: req.params.id, userId });

        if (!pet) {
            res.status(404);
            throw new Error('Pet not found');
        }

        await Pet.findByIdAndDelete(req.params.id);
        res.json({ message: 'Pet removed successfully' });
    } catch (error) {
        res.status(res.statusCode === 200 ? 500 : res.statusCode);
        throw error;
    }
};

module.exports = {
    createPet,
    getUserPets,
    getPetById,
    updatePet,
    deletePet,
};
