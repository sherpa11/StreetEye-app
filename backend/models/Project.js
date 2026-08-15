const mongoose = require('mongoose');
const { PROJECT_STATUS } = require('../constants');

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true, trim: true },
  roadName: { type: String, trim: true },
  description: { type: String },
  location: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  contractorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  totalBudget: { type: Number, required: true },
  constructionAllocation: { type: Number }, // 80%
  retainedAmount: { type: Number },         // 20%
  releasedRetainedAmount: { type: Number, default: 0 },
  startDate: Date,
  expectedCompletionDate: Date,
  status: {
    type: String,
    enum: Object.values(PROJECT_STATUS),
    default: PROJECT_STATUS.PLANNING
  },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, {
  timestamps: true
});

// Auto-calculate 80/20 before save
projectSchema.pre('save', function(next) {
  if (this.isModified('totalBudget') || this.isNew) {
    this.constructionAllocation = this.totalBudget * 0.80;
    this.retainedAmount = this.totalBudget * 0.20;
  }
  next();
});

module.exports = mongoose.model('Project', projectSchema);
