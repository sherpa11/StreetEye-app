const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLES } = require('../constants');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: Object.values(ROLES),
    required: true
  },
  // Citizen fields
  name: { type: String, trim: true },
  phone: { type: String, trim: true },
  email: { type: String, trim: true, lowercase: true },
  // Contractor fields
  firmName: { type: String, trim: true },
  gstin: { type: String, trim: true, uppercase: true },
  contractorNumber: { type: String, trim: true },
  // Authority fields
  governmentId: { type: String, trim: true },
  // Auth
  passwordHash: { type: String, required: true },
  isVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true }
}, {
  timestamps: true
});

// Indexes
userSchema.index({ phone: 1 }, { unique: true, sparse: true });
userSchema.index({ contractorNumber: 1 }, { unique: true, sparse: true });
userSchema.index({ governmentId: 1 }, { unique: true, sparse: true });
userSchema.index({ gstin: 1 }, { unique: true, sparse: true });

userSchema.methods.matchPassword = async function(password) {
  return await bcrypt.compare(password, this.passwordHash);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
