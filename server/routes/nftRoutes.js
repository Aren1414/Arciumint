const express = require('express');
const router = express.Router();
const { getAllNFTs, createNFT } = require('../controllers/nftController');

router.get('/', getAllNFTs);
router.post('/', createNFT);

module.exports = router;
