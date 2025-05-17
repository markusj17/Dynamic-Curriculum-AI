import apiClient from './api';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default {
  async createCheckoutSession(priceId) {
    const response = await apiClient.post('/stripe/create-checkout-session', { priceId });
    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({
      sessionId: response.data.sessionId,
    });
    if (error) {
      console.error("Stripe redirectToCheckout error:", error);
      // Handle error (e.g., display a message to the user)
    }
    return response.data; // Though redirection usually happens before this
  },
  async createPortalSession() {
    const response = await apiClient.post('/stripe/create-portal-session');
    window.location.href = response.data.url; // Redirect to Stripe portal
    return response.data;
  },
  getSubscriptionStatus() {
    return apiClient.get('/stripe/subscription-status');
  }
};