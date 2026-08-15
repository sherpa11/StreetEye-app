const Complaint = require('../models/Complaint');
const User = require('../models/User');

const generateTicketId = async () => {
  const year = new Date().getFullYear();
  const count = await Complaint.countDocuments() + 1;
  return `ST-${year}-${String(count).padStart(4, '0')}`;
};

const generateContractorNumber = async () => {
  const year = new Date().getFullYear();
  const count = await User.countDocuments({ role: 'contractor' }) + 1;
  return `CTR-${year}-${String(count).padStart(3, '0')}`;
};

module.exports = { generateTicketId, generateContractorNumber };
