const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const ContractorMetrics = require('../models/ContractorMetrics');
const { generateContractorNumber } = require('../utils/generateId');
const { ROLES } = require('../constants');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// POST /api/auth/citizen/register
const citizenRegister = async (req, res, next) => {
  try {
    const { name, phone, password, email } = req.body;
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required' });
    }
    const existing = await User.findOne({ phone });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Phone number already registered' });
    }
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);
    const user = await User.create({
      role: ROLES.CITIZEN,
      name,
      phone,
      email: email || undefined,
      passwordHash
    });
    const token = generateToken(user._id);
    res.status(201).json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/citizen/login
const citizenLogin = async (req, res, next) => {
  try {
    const { phone, password } = req.body;
    if (!phone || !password) {
      return res.status(400).json({ success: false, message: 'Phone and password are required' });
    }
    const user = await User.findOne({ phone, role: ROLES.CITIZEN });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid phone or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/contractor/register
const contractorRegister = async (req, res, next) => {
  try {
    const { firmName, gstin, password } = req.body;
    if (!firmName || !gstin || !password) {
      return res.status(400).json({ success: false, message: 'Firm name, GSTIN and password are required' });
    }
    const existing = await User.findOne({ gstin: gstin.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'GSTIN already registered' });
    }
    const contractorNumber = await generateContractorNumber();
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    const user = await User.create({
      role: ROLES.CONTRACTOR,
      firmName,
      gstin: gstin.toUpperCase(),
      contractorNumber,
      passwordHash
    });

    // Initialize metrics
    await ContractorMetrics.create({ contractorId: user._id });

    res.status(201).json({
      success: true,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/contractor/login
const contractorLogin = async (req, res, next) => {
  try {
    const { contractorNumber, password } = req.body;
    if (!contractorNumber || !password) {
      return res.status(400).json({ success: false, message: 'Contractor number and password are required' });
    }
    const user = await User.findOne({ contractorNumber, role: ROLES.CONTRACTOR });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid contractor number or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/auth/authority/login
const authorityLogin = async (req, res, next) => {
  try {
    const { governmentId, password } = req.body;
    if (!governmentId || !password) {
      return res.status(400).json({ success: false, message: 'Government ID and password are required' });
    }
    const user = await User.findOne({ governmentId, role: ROLES.AUTHORITY });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid government ID or password' });
    }
    if (!user.isActive) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: user.toSafeObject()
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
  res.json({ success: true, user: req.user });
};

module.exports = {
  citizenRegister,
  citizenLogin,
  contractorRegister,
  contractorLogin,
  authorityLogin,
  getMe
};
