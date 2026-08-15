const express = require('express');
const router = express.Router();
const { citizenRegister, citizenLogin, contractorRegister, contractorLogin, authorityLogin, getMe } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');

router.post('/citizen/register', citizenRegister);
router.post('/citizen/login', citizenLogin);
router.post('/contractor/register', protect, authorize(ROLES.AUTHORITY), contractorRegister);
router.post('/contractor/login', contractorLogin);
router.post('/authority/login', authorityLogin);
router.get('/me', protect, getMe);

module.exports = router;
