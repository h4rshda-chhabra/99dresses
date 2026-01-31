const express = require('express');
const router = express.Router();
const { createReview, getSellerReviews, checkEligibility } = require('../controllers/reviewController');

router.post('/', createReview);
router.get('/seller/:sellerId', getSellerReviews);
router.get('/can-review/:sellerId', checkEligibility);

module.exports = router;
