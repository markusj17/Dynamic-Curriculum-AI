const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const createCheckoutSession = async (userId, priceId, companyId, userEmail) => {
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!process.env.STRIPE_SECRET_KEY) {
        console.error("FATAL: STRIPE_SECRET_KEY is not set in the environment.");
        throw new Error('Stripe secret key not configured on server.');
    }
    if (!userId || !priceId || !userEmail) {
        console.error("Missing required params for createCheckoutSession", { userId, priceId, userEmail });
        throw new Error('User ID, Price ID, and User Email are required.');
    }

    try {
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [{ price: priceId, quantity: 1 }],
            mode: 'subscription',
            success_url: `${clientURL}/subscription-success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${clientURL}/subscription-canceled`,
            customer_email: userEmail,
            client_reference_id: userId.toString(),
            metadata: {
                userId: userId.toString(),
                companyId: companyId ? companyId.toString() : 'N/A',
            }
        });
        return session;
    } catch (error) {
        console.error("Stripe API Error in createCheckoutSession:", error);
        throw error;
    }
};

const handleWebhook = async (payload, sig) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
        console.error("FATAL: STRIPE_WEBHOOK_SECRET is not set in backend environment.");
        throw new Error('Stripe webhook secret not configured on server.');
    }

    let event;
    try {
        event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        console.log(`Webhook event constructed: ${event.type}, ID: ${event.id}`);
    } catch (err) {
        console.error(`⚠️ Webhook signature verification failed for event ID: ${event ? event.id : 'unknown'}. Error:`, err.message);
        throw new Error(`Webhook signature verification failed: ${err.message}`);
    }

    const { User } = require('../models'); // Require here to avoid potential circular deps at init

    switch (event.type) {
        case 'checkout.session.completed':
            const session = event.data.object;
            console.log(`Processing checkout.session.completed for session ID: ${session.id}`);

            const userId = session.client_reference_id || session.metadata?.userId;
            const stripeCustomerId = session.customer;
            const stripeSubscriptionId = session.subscription; // Get the subscription ID

            if (!userId) {
                console.error(`Webhook Error (checkout.session.completed): Missing userId in session ${session.id}. client_reference_id: ${session.client_reference_id}, metadata.userId: ${session.metadata?.userId}`);
                break; // Or throw error
            }
            if (!stripeCustomerId) {
                console.error(`Webhook Error (checkout.session.completed): Missing stripeCustomerId in session ${session.id} for userId ${userId}.`);
                break; // Or throw error
            }
             if (!stripeSubscriptionId) {
                console.error(`Webhook Error (checkout.session.completed): Missing stripeSubscriptionId in session ${session.id} for userId ${userId}.`);
                break; // Or throw error
            }

            try {
                // Fetch the subscription to get its status (e.g., 'trialing' or 'active')
                const subscriptionDetails = await stripe.subscriptions.retrieve(stripeSubscriptionId);
                const subscriptionStatus = subscriptionDetails.status; // 'active', 'trialing', 'past_due'

                const [updatedCount] = await User.update(
                    {
                        stripe_customer_id: stripeCustomerId,
                        stripe_subscription_id: stripeSubscriptionId,
                        subscription_status: subscriptionStatus,
                    },
                    { where: { id: userId } }
                );

                if (updatedCount > 0) {
                    console.log(`User ${userId} subscription activated/updated. Status: ${subscriptionStatus}. Stripe Customer ID: ${stripeCustomerId}, Stripe Subscription ID: ${stripeSubscriptionId}`);
                } else {
                    console.warn(`Webhook (checkout.session.completed): User ${userId} not found or not updated for session ${session.id}.`);
                }
            } catch (dbError) {
                console.error(`Webhook DB Error (checkout.session.completed) updating user ${userId} for session ${session.id}:`, dbError);
            }
            break;

        case 'customer.subscription.updated':
            const updatedSubscription = event.data.object;
            console.log(`Processing customer.subscription.updated for subscription ID: ${updatedSubscription.id}`);
            const custIdForUpdatedSub = updatedSubscription.customer;
            try {
                const userForUpdatedSub = await User.findOne({ where: { stripe_customer_id: custIdForUpdatedSub } });
                if (userForUpdatedSub) {
                    let appStatus = 'inactive'; // Default for unhandled statuses
                    if (['active', 'trialing'].includes(updatedSubscription.status)) {
                        appStatus = updatedSubscription.status;
                    } else if (updatedSubscription.status === 'canceled') {
                        appStatus = 'canceled';
                    } else if (['past_due', 'unpaid', 'incomplete'].includes(updatedSubscription.status)) {
                        appStatus = 'past_due'; 
                    }

                    await User.update(
                        { subscription_status: appStatus, stripe_subscription_id: updatedSubscription.id },
                        { where: { id: userForUpdatedSub.id } }
                    );
                    console.log(`User ${userForUpdatedSub.id} subscription status updated to ${appStatus} via customer.subscription.updated for sub ID ${updatedSubscription.id}.`);
                } else {
                    console.warn(`Webhook (customer.subscription.updated): User not found for Stripe customer ID: ${custIdForUpdatedSub}`);
                }
            } catch (dbError) {
                console.error(`Webhook DB Error (customer.subscription.updated) for sub ID ${updatedSubscription.id}:`, dbError);
            }
            break;

        case 'customer.subscription.deleted': 
            const deletedSubscription = event.data.object;
            console.log(`Processing customer.subscription.deleted for subscription ID: ${deletedSubscription.id}`);
            const custIdForDeletedSub = deletedSubscription.customer;
            try {
                const userForDeletedSub = await User.findOne({ where: { stripe_customer_id: custIdForDeletedSub } });
                if (userForDeletedSub) {
                    await User.update(
                        { subscription_status: 'canceled' }, 
                        { where: { id: userForDeletedSub.id } }
                    );
                    console.log(`User ${userForDeletedSub.id} subscription status set to canceled for sub ID ${deletedSubscription.id}.`);
                } else {
                    console.warn(`Webhook (customer.subscription.deleted): User not found for Stripe customer ID: ${custIdForDeletedSub}`);
                }
            } catch (dbError) {
                console.error(`Webhook DB Error (customer.subscription.deleted) for sub ID ${deletedSubscription.id}:`, dbError);
            }
            break;

        default:
            console.log(`Unhandled webhook event type: ${event.type}. Event ID: ${event.id}`);
    }
    return { received: true };
};

const createPortalSession = async (stripeCustomerId) => {
    const clientURL = process.env.CLIENT_URL || 'http://localhost:5173';
    if (!stripeCustomerId) {
        console.error("createPortalSession called without stripeCustomerId.");
        throw new Error('Stripe Customer ID is required to create a portal session.');
    }
    try {
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: stripeCustomerId,
            return_url: `${clientURL}/subscription`, 
        });
        return portalSession;
    } catch (error) {
        console.error("Stripe API Error in createPortalSession:", error);
        throw error;
    }
};

module.exports = {
    createCheckoutSession,
    handleWebhook,
    createPortalSession,
};