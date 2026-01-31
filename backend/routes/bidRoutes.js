const express = require('express');
const router = express.Router();
const { placeBid, getItemBids, acceptBid } = require('../controllers/bidController');

router.post('/', placeBid);
router.get('/:id/bids', getItemBids); // Note: RESTful path might be /items/:id/bids, but keeping simple for now
router.post('/accept', acceptBid);

module.exports = router;
