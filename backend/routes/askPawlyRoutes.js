const express = require('express');
const router = express.Router();
const { getPawlyResponse } = require('../controllers/askPawlyController');

// POST /api/ask-pawly
router.post('/', getPawlyResponse);

module.exports = router;
