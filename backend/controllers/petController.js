const Pet = require('../models/Pet');

// @desc  Get all pets for the logged-in user
// @route GET /api/pets
// @access Private
const getMyPets = async (req, res) => {
    try {
        const pets = await Pet.find({ owner: req.user._id }).sort({ createdAt: -1 });
        res.json(pets);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pets' });
    }
};

// @desc  Get a single pet by ID
// @route GET /api/pets/:id
// @access Private
const getPetById = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id });
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        res.json(pet);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching pet' });
    }
};

// @desc  Create a new pet
// @route POST /api/pets
// @access Private
const createPet = async (req, res) => {
    try {
        const { name, type, breed, age, weight, gender, color, neutered, microchipped, vaccinated, profileImage } = req.body;
        if (!name || !type) return res.status(400).json({ message: 'Pet name and type are required' });

        const pet = await Pet.create({
            owner: req.user._id,
            name, type,
            breed: breed || '',
            age: age || 0,
            weight: weight || 0,
            gender: gender || 'unknown',
            color: color || '',
            neutered: !!neutered,
            microchipped: !!microchipped,
            vaccinated: !!vaccinated,
            profileImage: profileImage || '',
        });
        res.status(201).json(pet);
    } catch (error) {
        res.status(500).json({ message: 'Server error creating pet' });
    }
};

// @desc  Update a pet
// @route PUT /api/pets/:id
// @access Private
const updatePet = async (req, res) => {
    try {
        const pet = await Pet.findOne({ _id: req.params.id, owner: req.user._id });
        if (!pet) return res.status(404).json({ message: 'Pet not found' });

        const fields = ['name', 'type', 'breed', 'age', 'weight', 'gender', 'color', 'neutered', 'microchipped', 'vaccinated', 'profileImage'];
        fields.forEach(f => { if (req.body[f] !== undefined) pet[f] = req.body[f]; });

        const updated = await pet.save();
        res.json(updated);
    } catch (error) {
        res.status(500).json({ message: 'Server error updating pet' });
    }
};

// @desc  Delete a pet
// @route DELETE /api/pets/:id
// @access Private
const deletePet = async (req, res) => {
    try {
        const pet = await Pet.findOneAndDelete({ _id: req.params.id, owner: req.user._id });
        if (!pet) return res.status(404).json({ message: 'Pet not found' });
        res.json({ message: 'Pet deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting pet' });
    }
};

module.exports = { getMyPets, getPetById, createPet, updatePet, deletePet };
