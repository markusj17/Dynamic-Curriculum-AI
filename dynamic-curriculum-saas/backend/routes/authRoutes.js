const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getMe, loginEmployee } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/me', protect, getMe);
router.post('/employee/login', loginEmployee);

module.exports = router;