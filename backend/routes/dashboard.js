const express = require('express');
const router = express.Router();
const { getCitizenDashboard, getContractorDashboard, getAuthorityDashboard } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');

router.get('/citizen', protect, authorize(ROLES.CITIZEN), getCitizenDashboard);
router.get('/contractor', protect, authorize(ROLES.CONTRACTOR), getContractorDashboard);
router.get('/authority', protect, authorize(ROLES.AUTHORITY), getAuthorityDashboard);

module.exports = router;
