const express = require('express');
const router = express.Router();
const { getWallet, buyCredits } = require('../controllers/walletController');

router.get('/:userId', getWallet);
router.post('/buy-credits', buyCredits);

module.exports = router;
