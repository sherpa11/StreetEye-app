const express = require('express');
const router = express.Router();
const { createTender, getAllTenders, getTenderById, addBid, getTenderRankings } = require('../controllers/tenderController');
const { protect, authorize } = require('../middleware/auth');
const { ROLES } = require('../constants');

router.post('/', protect, authorize(ROLES.AUTHORITY), createTender);
router.get('/', protect, getAllTenders);
router.get('/:id', protect, getTenderById);
router.post('/:id/bids', protect, authorize(ROLES.AUTHORITY), addBid);
router.get('/:id/rankings', protect, getTenderRankings);

module.exports = router;
