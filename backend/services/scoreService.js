/**
 * Contractor Performance Score Service
 * Formula:
 *   Score = 0.30 × Rectification Rate
 *         + 0.25 × On-Time Resolution Rate
 *         + 0.25 × Quality Approval Rate
 *         + 0.10 × Repeat Issue Score
 *         + 0.10 × Budget Compliance Score
 */

const ContractorMetrics = require('../models/ContractorMetrics');
const Complaint = require('../models/Complaint');
const { COMPLAINT_STATUS } = require('../constants');

const RESOLUTION_TIME_TARGET_HOURS = 72; // 3 days

const calculateScore = (metrics) => {
  const score =
    0.30 * metrics.rectificationRate +
    0.25 * metrics.onTimeResolutionRate +
    0.25 * metrics.qualityApprovalRate +
    0.10 * metrics.repeatIssueScore +
    0.10 * metrics.budgetComplianceScore;
  return parseFloat(score.toFixed(2));
};

/**
 * Recalculate contractor metrics from complaint data and update DB.
 * Called after authority approves/rejects a rectification.
 */
const recalculateContractorMetrics = async (contractorId) => {
  try {
    let metrics = await ContractorMetrics.findOne({ contractorId });
    if (!metrics) {
      metrics = new ContractorMetrics({ contractorId });
    }

    const assigned = await Complaint.find({ contractorId });
    const resolved = assigned.filter(c => c.status === COMPLAINT_STATUS.RESOLVED);
    const rectified = assigned.filter(c =>
      c.repair && c.repair.authorityApproved === true
    );

    metrics.totalAssigned = assigned.length;
    metrics.totalResolved = resolved.length;

    // Rectification Rate: resolved complaints / total assigned
    metrics.rectificationRate = assigned.length > 0
      ? parseFloat(((resolved.length / assigned.length) * 100).toFixed(2))
      : 0;

    // On-Time Resolution Rate: resolved within target time
    const onTimeCount = resolved.filter(c => {
      if (!c.repair?.startedAt || !c.repair?.verifiedAt) return false;
      const hoursToResolve = (new Date(c.repair.verifiedAt) - new Date(c.repair.startedAt)) / (1000 * 60 * 60);
      return hoursToResolve <= RESOLUTION_TIME_TARGET_HOURS;
    }).length;
    metrics.totalOnTime = onTimeCount;
    metrics.onTimeResolutionRate = resolved.length > 0
      ? parseFloat(((onTimeCount / resolved.length) * 100).toFixed(2))
      : 0;

    // Quality Approval Rate: authority-approved repairs / total resolved
    metrics.totalQualityApproved = rectified.length;
    metrics.qualityApprovalRate = resolved.length > 0
      ? parseFloat(((rectified.length / resolved.length) * 100).toFixed(2))
      : 0;

    // Repeat Issue Score: penalize for repeated complaints on same area
    // Simple: if repeat issues > 10% of assigned, deduct
    const repeatPenalty = Math.min(50, metrics.totalRepeatIssues * 5);
    metrics.repeatIssueScore = Math.max(0, 100 - repeatPenalty);

    // Budget Compliance: default 100 (can be updated when project budget is exceeded)
    if (!metrics.budgetComplianceScore || metrics.budgetComplianceScore === 0) {
      metrics.budgetComplianceScore = 90; // default
    }

    // Average resolution time
    const resolvedWithTimes = resolved.filter(c => c.repair?.startedAt && c.repair?.verifiedAt);
    if (resolvedWithTimes.length > 0) {
      const totalHours = resolvedWithTimes.reduce((sum, c) => {
        return sum + (new Date(c.repair.verifiedAt) - new Date(c.repair.startedAt)) / (1000 * 60 * 60);
      }, 0);
      metrics.averageResolutionTime = parseFloat((totalHours / resolvedWithTimes.length).toFixed(2));
    }

    metrics.overallScore = calculateScore(metrics);
    metrics.updatedAt = new Date();

    await metrics.save();
    return metrics;
  } catch (error) {
    console.error('Score recalculation error:', error);
    throw error;
  }
};

module.exports = { calculateScore, recalculateContractorMetrics };
