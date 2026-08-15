const express = require('express');
const router = express.Router();
const { analyzeRoad } = require('../controllers/aiController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants');

router.post('/analyze-road', protect, upload.single('image'), analyzeRoad);

module.exports = router;
