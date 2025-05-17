const stripeService = require('../services/stripeService');
const { User } = require('../models');

exports.stripeWebhook = async (req, res, next) => { // 
    try {
        const sig = req.headers['stripe-signature'];
        const payload = req.body; 

        if (!sig) {
            console.warn("[WEBHOOK_CONTROLLER] Stripe Webhook: Missing Stripe signature.");
            return res.status(400).send('Webhook Error: Missing Stripe signature.');
        }
        if (!payload || payload.length === 0) {
            console.warn("[WEBHOOK_CONTROLLER] Stripe Webhook: Missing or empty payload.");
            return res.status(400).send('Webhook Error: Missing or empty payload.');
        }
        
        console.log("[WEBHOOK_CONTROLLER] Stripe Webhook: Received, attempting to handle.");
        await stripeService.handleWebhook(payload, sig); 
        res.status(200).json({ received: true });
    } catch (error) {
        console.error('[WEBHOOK_CONTROLLER] Stripe Webhook Error:', error.message, error.stack ? `\nStack: ${error.stack}` : '');
        const statusCode = error.statusCode || 400; 
        res.status(statusCode).send(`Webhook Error: ${error.message}`);
    }
};

exports.createCheckoutSession = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { priceId } = req.body;
    
    const user = await User.findByPk(userId);
    if (!user) {
        const err = new Error("User not found.");
        err.statusCode = 404;
        throw err; 
    }
    if (!priceId) {
        const err = new Error("Price ID is required.");
        err.statusCode = 400;
        throw err;
    }
    if (!user.company_id) {
        const err = new Error("User not associated with a company.");
        err.statusCode = 400;
        throw err;
    }

    const session = await stripeService.createCheckoutSession(userId, priceId, user.company_id, user.email);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    next(error); 
  }
};

exports.createPortalSession = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripe_customer_id) {
            const err = new Error("User not found or no Stripe customer ID.");
            err.statusCode = 400;
            throw err;
        }
        const portalSession = await stripeService.createPortalSession(user.stripe_customer_id);
        res.json({ url: portalSession.url });
    } catch (error) {
        next(error);
    }
};

exports.getSubscriptionStatus = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['id','subscription_status', 'stripe_customer_id'] });
        if (!user) {
            const err = new Error("User not found.");
            err.statusCode = 404;
            throw err;
        }
        console.log(`User ${user.id} status check from controller: ${user.subscription_status}`);
        res.json({
            status: user.subscription_status,
            hasStripeCustomer: !!user.stripe_customer_id
        });
    } catch (error) {
        next(error);
    }
};