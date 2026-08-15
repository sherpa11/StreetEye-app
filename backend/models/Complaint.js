const mongoose = require('mongoose');
const { COMPLAINT_STATUS, SEVERITY, PRIORITY } = require('../constants');

const statusHistorySchema = new mongoose.Schema({
  status: String,
  changedAt: { type: Date, default: Date.now },
  changedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  remarks: String
}, { _id: false });

const complaintSchema = new mongoose.Schema({
  ticketId: { type: String, unique: true },
  citizenId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  issueType: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String }
  },
  evidenceImage: { type: String }, // file path/url
  aiAnalysis: {
    detectedIssue: String,
    confidence: Number,
    severity: String,
    recommendedPriority: String,
    analyzedAt: Date
  },
  severity: {
    type: String,
    enum: Object.values(SEVERITY),
    default: SEVERITY.MEDIUM
  },
  priority: {
    type: String,
    enum: Object.values(PRIORITY),
    default: PRIORITY.NORMAL
  },
  status: {
    type: String,
    enum: Object.values(COMPLAINT_STATUS),
    default: COMPLAINT_STATUS.NEW
  },
  authorityId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project' },
  verification: {
    verified: { type: Boolean },
    remarks: String,
    verifiedAt: Date
  },
  repair: {
    beforeImage: String,
    afterImage: String,
    repairNotes: String,
    startedAt: Date,
    submittedAt: Date,
    authorityApproved: Boolean,
    authorityRemarks: String,
    verifiedAt: Date
  },
  statusHistory: [statusHistorySchema],
  createdAt: { type: Date, default: Date.now },
  resolvedAt: Date
}, {
  timestamps: true
});

complaintSchema.index({ citizenId: 1 });
complaintSchema.index({ contractorId: 1 });
complaintSchema.index({ status: 1 });
complaintSchema.index({ 'location.latitude': 1, 'location.longitude': 1 });

module.exports = mongoose.model('Complaint', complaintSchema);
