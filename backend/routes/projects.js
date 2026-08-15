const express = require('express');
const router = express.Router();
const { createProject, getAllProjects, getProjectById, getProjectBudget, updateProjectBudget } = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');

router.post('/', protect, authorize(ROLES.AUTHORITY), createProject);
router.get('/', protect, getAllProjects);
router.get('/:id', protect, getProjectById);
router.get('/:id/budget', protect, getProjectBudget);
router.patch('/:id/budget', protect, authorize(ROLES.AUTHORITY), updateProjectBudget);

module.exports = router;
