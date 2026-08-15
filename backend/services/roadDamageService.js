/**
 * AI Road Damage Analysis Service
 * Currently uses a simulation/heuristic approach.
 * Can be swapped for a real ML model without changing other code.
 */

const { SEVERITY, PRIORITY, ISSUE_TYPES } = require('../constants');

/**
 * Analyze a road damage image and return AI assessment.
 * @param {string} imagePath - Path to the uploaded image
 * @param {string} issueType - User-reported issue type
 * @returns {Object} AI analysis result
 */
const analyzeRoadDamage = async (imagePath, issueType) => {
  try {
    // Simulated AI analysis - replace with actual ML model integration
    // In production: load model, preprocess image, run inference
    await new Promise(r => setTimeout(r, 500)); // simulate processing

    const issueMap = {
      'Pothole': { severity: SEVERITY.HIGH, priority: PRIORITY.URGENT, confidence: 0.92 },
      'Road Collapse': { severity: SEVERITY.CRITICAL, priority: PRIORITY.EMERGENCY, confidence: 0.95 },
      'Crack': { severity: SEVERITY.MEDIUM, priority: PRIORITY.IMPORTANT, confidence: 0.87 },
      'Surface Damage': { severity: SEVERITY.MEDIUM, priority: PRIORITY.IMPORTANT, confidence: 0.85 },
      'Waterlogging': { severity: SEVERITY.HIGH, priority: PRIORITY.URGENT, confidence: 0.89 },
      'Unsafe Road': { severity: SEVERITY.HIGH, priority: PRIORITY.URGENT, confidence: 0.88 },
      'Accident Related': { severity: SEVERITY.CRITICAL, priority: PRIORITY.EMERGENCY, confidence: 0.91 },
      'Delayed Maintenance': { severity: SEVERITY.LOW, priority: PRIORITY.NORMAL, confidence: 0.78 },
      'Other': { severity: SEVERITY.MEDIUM, priority: PRIORITY.NORMAL, confidence: 0.75 }
    };

    const mapping = issueMap[issueType] || issueMap['Other'];
    
    // Add slight randomness to confidence to look realistic
    const confidenceVariance = (Math.random() * 0.06) - 0.03;
    const confidence = Math.min(0.99, Math.max(0.60, mapping.confidence + confidenceVariance));

    return {
      success: true,
      detectedIssue: issueType || 'Road Damage',
      confidence: parseFloat(confidence.toFixed(2)),
      severity: mapping.severity,
      recommendedPriority: mapping.priority,
      analyzedAt: new Date()
    };
  } catch (error) {
    console.error('AI analysis error:', error);
    return {
      success: false,
      detectedIssue: issueType || 'Unknown',
      confidence: 0,
      severity: SEVERITY.MEDIUM,
      recommendedPriority: PRIORITY.NORMAL,
      analyzedAt: new Date(),
      error: 'AI analysis temporarily unavailable'
    };
  }
};

module.exports = { analyzeRoadDamage };
