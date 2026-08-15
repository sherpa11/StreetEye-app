const Tender = require('../models/Tender');
const ContractorMetrics = require('../models/ContractorMetrics');
const User = require('../models/User');
const { TENDER_STATUS, ROLES } = require('../constants');

const calculateTenderScores = (bids) => {
  const validBids = bids.filter(b => b.quotation > 0);
  if (validBids.length === 0) return bids;
  const lowestQuotation = Math.min(...validBids.map(b => b.quotation));
  return bids.map(bid => {
    const priceScore = (lowestQuotation / bid.quotation) * 100;
    const finalTenderScore = 0.80 * bid.contractorPerformanceScore + 0.20 * priceScore;
    return {
      ...bid,
      priceScore: parseFloat(priceScore.toFixed(2)),
      finalTenderScore: parseFloat(finalTenderScore.toFixed(2))
    };
  });
};

const rankBids = (bids) => {
  const sorted = [...bids].sort((a, b) => b.finalTenderScore - a.finalTenderScore);
  return sorted.map((bid, idx) => ({ ...bid, rank: idx + 1 }));
};

// POST /api/tenders
const createTender = async (req, res, next) => {
  try {
    const { title, description, estimatedBudget } = req.body;
    if (!title) return res.status(400).json({ success: false, message: 'Title is required' });
    const tender = await Tender.create({
      title, description, estimatedBudget,
      createdBy: req.user._id
    });
    res.status(201).json({ success: true, tender });
  } catch (error) {
    next(error);
  }
};

// GET /api/tenders
const getAllTenders = async (req, res, next) => {
  try {
    const tenders = await Tender.find().sort({ createdAt: -1 });
    res.json({ success: true, tenders });
  } catch (error) {
    next(error);
  }
};

// GET /api/tenders/:id
const getTenderById = async (req, res, next) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('bids.contractorId', 'firmName contractorNumber');
    if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });
    res.json({ success: true, tender });
  } catch (error) {
    next(error);
  }
};

// POST /api/tenders/:id/bids
const addBid = async (req, res, next) => {
  try {
    const { contractorId, quotation } = req.body;
    if (!contractorId || !quotation) {
      return res.status(400).json({ success: false, message: 'Contractor ID and quotation are required' });
    }
    const tender = await Tender.findById(req.params.id);
    if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });
    if (tender.status !== TENDER_STATUS.OPEN) {
      return res.status(400).json({ success: false, message: 'Tender is not open for bids' });
    }
    // Get contractor metrics
    const metrics = await ContractorMetrics.findOne({ contractorId });
    const performanceScore = metrics ? metrics.overallScore : 0;
    // Remove existing bid from same contractor
    tender.bids = tender.bids.filter(b => b.contractorId.toString() !== contractorId);
    tender.bids.push({ contractorId, quotation: parseFloat(quotation), contractorPerformanceScore: performanceScore });
    // Recalculate all scores
    const scoredBids = calculateTenderScores(tender.bids.map(b => b.toObject ? b.toObject() : b));
    const rankedBids = rankBids(scoredBids);
    tender.bids = rankedBids;
    await tender.save();
    res.json({ success: true, tender });
  } catch (error) {
    next(error);
  }
};

// GET /api/tenders/:id/rankings
const getTenderRankings = async (req, res, next) => {
  try {
    const tender = await Tender.findById(req.params.id)
      .populate('bids.contractorId', 'firmName contractorNumber gstin');
    if (!tender) return res.status(404).json({ success: false, message: 'Tender not found' });
    const sorted = [...tender.bids].sort((a, b) => a.rank - b.rank);
    res.json({ success: true, tender: { ...tender.toObject(), bids: sorted } });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTender, getAllTenders, getTenderById, addBid, getTenderRankings };
