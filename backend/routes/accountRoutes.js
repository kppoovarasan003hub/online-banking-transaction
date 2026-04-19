const express = require('express');
const router = express.Router();
const { getAccountDetails, getBeneficiaries, addBeneficiary } = require('../controllers/accountController');

router.get('/details', getAccountDetails);
router.get('/beneficiaries', getBeneficiaries);
router.post('/beneficiaries', addBeneficiary);

module.exports = router;
