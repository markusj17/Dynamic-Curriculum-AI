const express = require('express');
const router = express.Router();
const { getMyCompany, updateMyCompany } = require('../controllers/companyController');
const { protect } = require('../middleware/authMiddleware');

router.route('/my-company')
  .get(protect, getMyCompany)
  .put(protect, updateMyCompany);

module.exports = router;