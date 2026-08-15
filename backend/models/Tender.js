const mongoose = require('mongoose');
const { TENDER_STATUS } = require('../constants');

const bidSchema = new mongoose.Schema({
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quotation: Number,
  contractorPerformanceScore: Number,
  priceScore: Number,
  finalTenderScore: Number,
  rank: Number
}, { _id: false });

const tenderSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  estimatedBudget: Number,
  bids: [bidSchema],
  status: {
    type: String,
    enum: Object.values(TENDER_STATUS),
    default: TENDER_STATUS.OPEN
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

module.exports = mongoose.model('Tender', tenderSchema);
