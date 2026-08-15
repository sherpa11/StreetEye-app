const Complaint = require('../models/Complaint');
const User = require('../models/User');
const { generateTicketId } = require('../utils/generateId');
const { COMPLAINT_STATUS, ROLES } = require('../constants');
const { recalculateContractorMetrics } = require('../services/scoreService');
const { analyzeRoadDamage } = require('../services/roadDamageService');
const path = require('path');

// Helper to add status history
const addStatusHistory = (complaint, status, userId, remarks = '') => {
  complaint.statusHistory.push({
    status,
    changedAt: new Date(),
    changedBy: userId,
    remarks
  });
  complaint.status = status;
};

// POST /api/complaints
const createComplaint = async (req, res, next) => {
  try {
    const { issueType, description, latitude, longitude, address } = req.body;
    if (!issueType || !description || !latitude || !longitude) {
      return res.status(400).json({ success: false, message: 'Issue type, description, latitude and longitude are required' });
    }
    const ticketId = await generateTicketId();
    const evidenceImage = req.file ? `/uploads/${req.file.filename}` : null;

    let aiAnalysis = null;
    if (evidenceImage) {
      const aiResult = await analyzeRoadDamage(req.file.path, issueType);
      if (aiResult.success) {
        aiAnalysis = aiResult;
      }
    }

    const complaint = await Complaint.create({
      ticketId,
      citizenId: req.user._id,
      issueType,
      description,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude), address },
      evidenceImage,
      aiAnalysis,
      severity: aiAnalysis?.severity || 'MEDIUM',
      priority: aiAnalysis?.recommendedPriority || 'NORMAL',
      status: COMPLAINT_STATUS.NEW,
      statusHistory: [{ status: COMPLAINT_STATUS.NEW, changedAt: new Date(), changedBy: req.user._id }]
    });

    res.status(201).json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/my
const getMyCitizenComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ citizenId: req.user._id })
      .populate('contractorId', 'firmName contractorNumber')
      .populate('authorityId', 'name governmentId')
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints (authority)
const getAllComplaints = async (req, res, next) => {
  try {
    const { status, severity, page = 1, limit = 50 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    const skip = (page - 1) * limit;
    const complaints = await Complaint.find(filter)
      .populate('citizenId', 'name phone')
      .populate('contractorId', 'firmName contractorNumber')
      .populate('authorityId', 'name governmentId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    const total = await Complaint.countDocuments(filter);
    res.json({ success: true, complaints, total, page: parseInt(page) });
  } catch (error) {
    next(error);
  }
};

// GET /api/complaints/:id
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('citizenId', 'name phone email')
      .populate('contractorId', 'firmName contractorNumber')
      .populate('authorityId', 'name governmentId')
      .populate('projectId', 'projectName');
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }
    // Citizens can only view their own
    if (req.user.role === ROLES.CITIZEN && complaint.citizenId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    // Contractors can only view their assigned complaints
    if (req.user.role === ROLES.CONTRACTOR && complaint.contractorId?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/verify
const verifyComplaint = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.status !== COMPLAINT_STATUS.NEW && complaint.status !== COMPLAINT_STATUS.UNDER_REVIEW) {
      return res.status(400).json({ success: false, message: `Cannot verify complaint with status ${complaint.status}` });
    }
    complaint.verification = { verified: true, remarks, verifiedAt: new Date() };
    complaint.authorityId = req.user._id;
    addStatusHistory(complaint, COMPLAINT_STATUS.VERIFIED, req.user._id, remarks);
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/reject
const rejectComplaint = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    complaint.verification = { verified: false, remarks, verifiedAt: new Date() };
    complaint.authorityId = req.user._id;
    addStatusHistory(complaint, COMPLAINT_STATUS.REJECTED, req.user._id, remarks);
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/assign
const assignContractor = async (req, res, next) => {
  try {
    const { contractorId, projectId } = req.body;
    if (!contractorId) return res.status(400).json({ success: false, message: 'Contractor ID is required' });
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.status !== COMPLAINT_STATUS.VERIFIED) {
      return res.status(400).json({ success: false, message: 'Complaint must be verified before assigning' });
    }
    const contractor = await User.findOne({ _id: contractorId, role: ROLES.CONTRACTOR });
    if (!contractor) return res.status(404).json({ success: false, message: 'Contractor not found' });
    complaint.contractorId = contractorId;
    if (projectId) complaint.projectId = projectId;
    addStatusHistory(complaint, COMPLAINT_STATUS.ASSIGNED, req.user._id, `Assigned to ${contractor.firmName}`);
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/start-repair
const startRepair = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.contractorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (complaint.status !== COMPLAINT_STATUS.ASSIGNED) {
      return res.status(400).json({ success: false, message: 'Complaint must be assigned before starting repair' });
    }
    const beforeImage = req.file ? `/uploads/${req.file.filename}` : null;
    complaint.repair = { ...complaint.repair, startedAt: new Date(), beforeImage };
    addStatusHistory(complaint, COMPLAINT_STATUS.IN_PROGRESS, req.user._id, 'Repair started');
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/submit-rectification
const submitRectification = async (req, res, next) => {
  try {
    const { repairNotes } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (complaint.contractorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (complaint.status !== COMPLAINT_STATUS.IN_PROGRESS) {
      return res.status(400).json({ success: false, message: 'Repair must be in progress' });
    }
    const afterImage = req.file ? `/uploads/${req.file.filename}` : null;
    complaint.repair = {
      ...complaint.repair,
      afterImage,
      repairNotes,
      submittedAt: new Date()
    };
    addStatusHistory(complaint, COMPLAINT_STATUS.RECTIFICATION_SUBMITTED, req.user._id, 'Rectification submitted for authority review');
    await complaint.save();
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/approve-rectification
const approveRectification = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (![COMPLAINT_STATUS.RECTIFICATION_SUBMITTED, COMPLAINT_STATUS.AUTHORITY_VERIFICATION].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for approval' });
    }
    complaint.repair = {
      ...complaint.repair,
      authorityApproved: true,
      authorityRemarks: remarks,
      verifiedAt: new Date()
    };
    complaint.resolvedAt = new Date();
    addStatusHistory(complaint, COMPLAINT_STATUS.RESOLVED, req.user._id, remarks || 'Repair approved and complaint resolved');
    await complaint.save();
    // Recalculate contractor score
    if (complaint.contractorId) {
      await recalculateContractorMetrics(complaint.contractorId);
    }
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// POST /api/complaints/:id/reject-rectification
const rejectRectification = async (req, res, next) => {
  try {
    const { remarks } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return res.status(404).json({ success: false, message: 'Complaint not found' });
    if (![COMPLAINT_STATUS.RECTIFICATION_SUBMITTED, COMPLAINT_STATUS.AUTHORITY_VERIFICATION].includes(complaint.status)) {
      return res.status(400).json({ success: false, message: 'Invalid status for rejection' });
    }
    complaint.repair = {
      ...complaint.repair,
      authorityApproved: false,
      authorityRemarks: remarks
    };
    addStatusHistory(complaint, COMPLAINT_STATUS.IN_PROGRESS, req.user._id, `Rectification rejected: ${remarks}`);
    await complaint.save();
    // Still recalculate
    if (complaint.contractorId) {
      await recalculateContractorMetrics(complaint.contractorId);
    }
    res.json({ success: true, complaint });
  } catch (error) {
    next(error);
  }
};

// GET /api/contractor/assignments
const getContractorAssignments = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ contractorId: req.user._id })
      .populate('citizenId', 'name phone')
      .populate('projectId', 'projectName')
      .sort({ createdAt: -1 });
    res.json({ success: true, complaints });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyCitizenComplaints,
  getAllComplaints,
  getComplaintById,
  verifyComplaint,
  rejectComplaint,
  assignContractor,
  startRepair,
  submitRectification,
  approveRectification,
  rejectRectification,
  getContractorAssignments
};
