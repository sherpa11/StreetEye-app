const mongoose = require('mongoose');

const contractorMetricsSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, required: true },
  totalAssigned: { type: Number, default: 0 },
  totalResolved: { type: Number, default: 0 },
  totalOnTime: { type: Number, default: 0 },
  totalQualityApproved: { type: Number, default: 0 },
  totalRepeatIssues: { type: Number, default: 0 },
  // Score components (0-100)
  rectificationRate: { type: Number, default: 0 },
  onTimeResolutionRate: { type: Number, default: 0 },
  qualityApprovalRate: { type: Number, default: 0 },
  repeatIssueScore: { type: Number, default: 100 },
  budgetComplianceScore: { type: Number, default: 100 },
  // Final
  overallScore: { type: Number, default: 0 },
  averageResolutionTime: { type: Number, default: 0 }, // in hours
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContractorMetrics', contractorMetricsSchema);
