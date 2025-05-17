const express = require('express');
const router = express.Router();
const {
    createCheckoutSession,
    stripeWebhook,
    createPortalSession,
    getSubscriptionStatus
} = require('../controllers/stripeController');
const { protect } = require('../middleware/authMiddleware');

router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/webhook', stripeWebhook); 
router.post('/create-portal-session', protect, createPortalSession);
router.get('/subscription-status', protect, getSubscriptionStatus);

module.exports = router;