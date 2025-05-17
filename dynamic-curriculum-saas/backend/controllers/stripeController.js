const stripeService = require('../services/stripeService');
const { User } = require('../models');


exports.stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const payload = Buffer.isBuffer(req.rawBody) ? req.rawBody.toString('utf8') : req.body;

  try {
    if (!sig) {
        console.warn("[WEBHOOK_CONTROLLER] Missing Stripe signature in request headers.");
        return res.status(400).send('Webhook Error: Missing Stripe signature.');
    }
    if (!payload) {
        console.warn("[WEBHOOK_CONTROLLER] Missing payload in request.");
        return res.status(400).send('Webhook Error: Missing payload.');
    }
    
    console.log("[WEBHOOK_CONTROLLER] Received webhook, attempting to handle.");
    await stripeService.handleWebhook(payload, sig);
    res.status(200).json({ received: true });
  } catch (error) {
    console.error('[WEBHOOK_CONTROLLER] Error in webhook handler:', error.message, error.stack ? `\nStack: ${error.stack}` : '');
    const statusCode = error.statusCode || 400;
    res.status(statusCode).send(`Webhook Error: ${error.message}`);
  }
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const userId = req.user.id;
    const { priceId } = req.body;
    const user = await User.findByPk(userId);
    if (!user) return res.status(404).json({ message: "User not found." });
    if (!priceId) return res.status(400).json({ message: 'Price ID is required.' });
    if (!user.company_id) return res.status(400).json({ message: 'User not associated with a company.' });
    const session = await stripeService.createCheckoutSession(userId, priceId, user.company_id, user.email);
    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error("Controller Error in createCheckoutSession:", error.message, error.stack ? `\nStack: ${error.stack}` : '');
    res.status(500).json({ message: 'Error creating Stripe checkout session.', error: error.message });
  }
};
exports.createPortalSession = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id);
        if (!user || !user.stripe_customer_id) {
            return res.status(400).json({ message: "User not found or no Stripe customer ID."});
        }
        const portalSession = await stripeService.createPortalSession(user.stripe_customer_id);
        res.json({ url: portalSession.url });
    } catch (error) {
        console.error("Controller Error in createPortalSession:", error.message, error.stack ? `\nStack: ${error.stack}` : '');
        res.status(500).json({ message: 'Error creating Stripe portal session', error: error.message });
    }
};
exports.getSubscriptionStatus = async (req, res) => { 
    try {
        const user = await User.findByPk(req.user.id, { attributes: ['id','subscription_status', 'stripe_customer_id'] });
        if (!user) return res.status(404).json({ message: "User not found." });
        res.json({ status: user.subscription_status, hasStripeCustomer: !!user.stripe_customer_id });
    } catch (error) {
        console.error("Controller Error in getSubscriptionStatus:", error.message, error.stack ? `\nStack: ${error.stack}` : '');
        res.status(500).json({ message: "Error fetching subscription status.", error: error.message });
    }
};