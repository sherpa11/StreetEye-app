const express = require('express');
const router = express.Router();
const {
  createComplaint, getMyCitizenComplaints, getAllComplaints,
  getComplaintById, verifyComplaint, rejectComplaint,
  assignContractor, startRepair, submitRectification,
  approveRectification, rejectRectification
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { ROLES } = require('../constants');

router.get('/my', protect, authorize(ROLES.CITIZEN), getMyCitizenComplaints);
router.post('/', protect, authorize(ROLES.CITIZEN), upload.single('evidenceImage'), createComplaint);
router.get('/', protect, authorize(ROLES.AUTHORITY), getAllComplaints);
router.get('/:id', protect, getComplaintById);
router.post('/:id/verify', protect, authorize(ROLES.AUTHORITY), verifyComplaint);
router.post('/:id/reject', protect, authorize(ROLES.AUTHORITY), rejectComplaint);
router.post('/:id/assign', protect, authorize(ROLES.AUTHORITY), assignContractor);
router.post('/:id/start-repair', protect, authorize(ROLES.CONTRACTOR), upload.single('beforeImage'), startRepair);
router.post('/:id/submit-rectification', protect, authorize(ROLES.CONTRACTOR), upload.single('afterImage'), submitRectification);
router.post('/:id/approve-rectification', protect, authorize(ROLES.AUTHORITY), approveRectification);
router.post('/:id/reject-rectification', protect, authorize(ROLES.AUTHORITY), rejectRectification);

module.exports = router;
