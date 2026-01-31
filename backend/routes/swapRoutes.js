const express = require('express');
const router = express.Router();
const { createSwapOffer, respondToSwap, getIncomingSwapOffers, getSwapDetails, getSentSwapOffers, deleteSwapOffer, createGeneralInquiry } = require('../controllers/swapController');

router.post('/', createSwapOffer);
router.post('/inquiry', createGeneralInquiry);
router.get('/incoming/:userId', getIncomingSwapOffers);
router.get('/sent/:userId', getSentSwapOffers);
router.get('/details/:id', getSwapDetails);
router.post('/respond', respondToSwap);
router.delete('/:id', deleteSwapOffer);

module.exports = router;
