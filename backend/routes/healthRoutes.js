const express = require('express');
const router = express.Router({ mergeParams: true });

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
router.get('/summary', getHealthSummary);

// Health Records
router.route('/records')
    .get(getHealthRecords)
    .post(createHealthRecord);

router.route('/records/:recordId')
    .get(getHealthRecordById)
    .put(updateHealthRecord)
    .delete(deleteHealthRecord);

// Vaccinations
router.route('/vaccinations')
    .get(getVaccinations)
    .post(createVaccination);

router.route('/vaccinations/:vacId')
    .put(updateVaccination)
    .delete(deleteVaccination);

// Weight Logs
router.route('/weight')
    .get(getWeightHistory)
    .post(addWeightEntry);

router.route('/weight/:logId')
    .delete(deleteWeightEntry);

module.exports = router;
