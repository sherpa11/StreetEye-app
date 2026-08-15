const Complaint = require('../models/Complaint');
const User = require('../models/User');
const Project = require('../models/Project');
const ContractorMetrics = require('../models/ContractorMetrics');
const Tender = require('../models/Tender');
const { COMPLAINT_STATUS, ROLES } = require('../constants');

// GET /api/dashboard/citizen
const getCitizenDashboard = async (req, res, next) => {
  try {
    const citizenId = req.user._id;
    const total = await Complaint.countDocuments({ citizenId });
    const open = await Complaint.countDocuments({ citizenId, status: { $in: [COMPLAINT_STATUS.NEW, COMPLAINT_STATUS.UNDER_REVIEW, COMPLAINT_STATUS.VERIFIED] } });
    const inProgress = await Complaint.countDocuments({ citizenId, status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS, COMPLAINT_STATUS.RECTIFICATION_SUBMITTED, COMPLAINT_STATUS.AUTHORITY_VERIFICATION] } });
    const resolved = await Complaint.countDocuments({ citizenId, status: COMPLAINT_STATUS.RESOLVED });
    const rejected = await Complaint.countDocuments({ citizenId, status: COMPLAINT_STATUS.REJECTED });
    const recent = await Complaint.find({ citizenId })
      .populate('contractorId', 'firmName')
      .sort({ createdAt: -1 })
      .limit(5);
    res.json({ success: true, stats: { total, open, inProgress, resolved, rejected }, recent });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/contractor
const getContractorDashboard = async (req, res, next) => {
  try {
    const contractorId = req.user._id;
    const metrics = await ContractorMetrics.findOne({ contractorId });
    const assigned = await Complaint.countDocuments({ contractorId });
    const active = await Complaint.countDocuments({ contractorId, status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS] } });
    const submitted = await Complaint.countDocuments({ contractorId, status: COMPLAINT_STATUS.RECTIFICATION_SUBMITTED });
    const completed = await Complaint.countDocuments({ contractorId, status: COMPLAINT_STATUS.RESOLVED });
    const recent = await Complaint.find({ contractorId })
      .populate('citizenId', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);
    res.json({ success: true, metrics, stats: { assigned, active, submitted, completed }, recent });
  } catch (error) {
    next(error);
  }
};

// GET /api/dashboard/authority
const getAuthorityDashboard = async (req, res, next) => {
  try {
    const total = await Complaint.countDocuments();
    const pending = await Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.NEW, COMPLAINT_STATUS.UNDER_REVIEW] } });
    const verified = await Complaint.countDocuments({ status: COMPLAINT_STATUS.VERIFIED });
    const activeRepair = await Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.ASSIGNED, COMPLAINT_STATUS.IN_PROGRESS] } });
    const pendingReview = await Complaint.countDocuments({ status: { $in: [COMPLAINT_STATUS.RECTIFICATION_SUBMITTED, COMPLAINT_STATUS.AUTHORITY_VERIFICATION] } });
    const resolved = await Complaint.countDocuments({ status: COMPLAINT_STATUS.RESOLVED });
    const rejected = await Complaint.countDocuments({ status: COMPLAINT_STATUS.REJECTED });
    const activeContractors = await User.countDocuments({ role: ROLES.CONTRACTOR, isActive: true });

    // Severity breakdown
    const severityBreakdown = await Complaint.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);

    // Status breakdown
    const statusBreakdown = await Complaint.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent complaints
    const recent = await Complaint.find()
      .populate('citizenId', 'name phone')
      .populate('contractorId', 'firmName')
      .sort({ createdAt: -1 })
      .limit(10);

    // Contractor scores
    const topContractors = await ContractorMetrics.find()
      .populate('contractorId', 'firmName contractorNumber')
      .sort({ overallScore: -1 })
      .limit(5);

    // Map data - all complaints with location
    const mapComplaints = await Complaint.find({ 'location.latitude': { $exists: true } })
      .populate('contractorId', 'firmName')
      .select('ticketId issueType severity status location contractorId');

    // Budget summary
    const projects = await Project.find().populate('contractorId', 'firmName');
    const totalBudget = projects.reduce((sum, p) => sum + p.totalBudget, 0);
    const totalRetained = projects.reduce((sum, p) => sum + p.retainedAmount, 0);
    const totalReleased = projects.reduce((sum, p) => sum + (p.releasedRetainedAmount || 0), 0);

    res.json({
      success: true,
      stats: { total, pending, verified, activeRepair, pendingReview, resolved, rejected, activeContractors },
      severityBreakdown,
      statusBreakdown,
      recent,
      topContractors,
      mapComplaints,
      budget: { totalBudget, totalRetained, totalReleased, projects: projects.length }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getCitizenDashboard, getContractorDashboard, getAuthorityDashboard };
