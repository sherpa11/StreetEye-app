const { analyzeRoadDamage } = require('../services/roadDamageService');

// POST /api/ai/analyze-road
const analyzeRoad = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Image file is required' });
    }
    const { issueType } = req.body;
    const result = await analyzeRoadDamage(req.file.path, issueType);
    res.json({ success: true, analysis: result });
  } catch (error) {
    next(error);
  }
};

module.exports = { analyzeRoad };
