const express = require('express');
const router = express.Router({ mergeParams: true });
const { protect } = require('../middleware/authMiddleware');

const {
    getHealthSummary,
    getHealthRecords,
    getHealthRecordById,
    createHealthRecord,
    updateHealthRecord,
    deleteHealthRecord,
} = require('../controllers/healthRecordController');

const {
    getVaccinations,
    createVaccination,
    updateVaccination,
    deleteVaccination,
} = require('../controllers/vaccinationController');

const {
    getWeightHistory,
    addWeightEntry,
    deleteWeightEntry,
} = require('../controllers/weightLogController');

// Health Summary
router.get('/summary', protect, getHealthSummary);

// Health Records
router.route('/records')
    .get(protect, getHealthRecords)
    .post(protect, createHealthRecord);

router.route('/records/:recordId')
    .get(protect, getHealthRecordById)
    .put(protect, updateHealthRecord)
    .delete(protect, deleteHealthRecord);

// Vaccinations
router.route('/vaccinations')
    .get(protect, getVaccinations)
    .post(protect, createVaccination);

router.route('/vaccinations/:vacId')
    .put(protect, updateVaccination)
    .delete(protect, deleteVaccination);

// Weight Logs
router.route('/weight')
    .get(protect, getWeightHistory)
    .post(protect, addWeightEntry);

router.route('/weight/:logId')
    .delete(protect, deleteWeightEntry);

module.exports = router;
