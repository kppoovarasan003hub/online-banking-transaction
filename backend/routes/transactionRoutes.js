const express = require('express');
const router = express.Router();
const { transferMoney, getHistory } = require('../controllers/transactionController');

router.post('/transfer', transferMoney);
router.get('/history', getHistory);

module.exports = router;
