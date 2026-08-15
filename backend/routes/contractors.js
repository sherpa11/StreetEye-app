const express = require('express');
const router = express.Router();
const { getAllContractors, getContractorById, getContractorScore } = require('../controllers/contractorController');
const { getContractorAssignments } = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');

router.get('/', protect, authorize(ROLES.AUTHORITY), getAllContractors);
router.get('/assignments', protect, authorize(ROLES.CONTRACTOR), getContractorAssignments);
router.get('/:id', protect, getContractorById);
router.get('/:id/score', protect, getContractorScore);

module.exports = router;
