const express = require('express');
const router = express.Router();
const {
    createPet,
    getUserPets,
    getPetById,
    updatePet,
    deletePet,
} = require('../controllers/petController');

router.route('/')
    .get(getUserPets)
    .post(createPet);

router.route('/:id')
    .get(getPetById)
    .put(updatePet)
    .delete(deletePet);

module.exports = router;
