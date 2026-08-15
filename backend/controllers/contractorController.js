const User = require('../models/User');
const ContractorMetrics = require('../models/ContractorMetrics');
const { ROLES } = require('../constants');

// GET /api/contractors
const getAllContractors = async (req, res, next) => {
  try {
    const contractors = await User.find({ role: ROLES.CONTRACTOR, isActive: true })
      .select('-passwordHash')
      .sort({ createdAt: -1 });
    // Fetch metrics for each
    const metrics = await ContractorMetrics.find({
      contractorId: { $in: contractors.map(c => c._id) }
    });
    const metricsMap = {};
    metrics.forEach(m => { metricsMap[m.contractorId.toString()] = m; });
    const result = contractors.map(c => ({
      ...c.toObject(),
      metrics: metricsMap[c._id.toString()] || null
    }));
    res.json({ success: true, contractors: result });
  } catch (error) {
    next(error);
  }
};

// GET /api/contractors/:id
const getContractorById = async (req, res, next) => {
  try {
    const contractor = await User.findOne({ _id: req.params.id, role: ROLES.CONTRACTOR }).select('-passwordHash');
    if (!contractor) return res.status(404).json({ success: false, message: 'Contractor not found' });
    const metrics = await ContractorMetrics.findOne({ contractorId: contractor._id });
    res.json({ success: true, contractor: { ...contractor.toObject(), metrics } });
  } catch (error) {
    next(error);
  }
};

// GET /api/contractors/:id/score
const getContractorScore = async (req, res, next) => {
  try {
    const metrics = await ContractorMetrics.findOne({ contractorId: req.params.id })
      .populate('contractorId', 'firmName contractorNumber');
    if (!metrics) return res.status(404).json({ success: false, message: 'Metrics not found' });
    res.json({ success: true, metrics });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllContractors, getContractorById, getContractorScore };
