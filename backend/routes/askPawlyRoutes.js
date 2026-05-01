const express = require('express');
const router = express.Router();
const { getPawlyResponse } = require('../controllers/askPawlyController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/ask-pawly (protected)
router.post('/', protect, getPawlyResponse);

module.exports = router;
