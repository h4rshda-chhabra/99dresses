const express = require('express');
const router = express.Router();
const { getSellerProfile } = require('../controllers/profileController');

router.get('/:userId', getSellerProfile);

module.exports = router;
