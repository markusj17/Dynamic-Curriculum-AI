<template>
  <div class="space-y-8 p-12">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        Subscription Management
      </h1>
      <p class="mt-2 text-sm text-slate-400">Manage your IntelliPath access plan.</p>
    </div>

    <div v-if="authStore.isLoading" class="card-intellipath p-8 text-center">
      <p class="text-slate-300 animate-pulse">Loading subscription details...</p>
    </div>

    <div v-else class="card-intellipath p-6 md:p-8 space-y-6 max-w-2xl mx-auto"> 
      <div v-if="checkoutError || portalError" class="bg-red-500/20 text-red-300 p-4 rounded-lg text-sm mb-4">
        <p><span class="font-semibold">Error:</span> {{ checkoutError || portalError }}</p>
      </div>

      <!-- Active Subscription State -->
      <div v-if="authStore.hasActiveSubscription" class="text-center space-y-4">
        <div>
          <p class="text-sm text-slate-400">Current Status:</p>
          <p class="text-xl font-semibold text-emerald-400 capitalize">
            {{ authStore.subscriptionStatus }}
          </p>
        </div>
        <p class="text-sm text-slate-400">
          Manage your billing details, view invoices, or update your subscription through the secure Stripe customer portal.
        </p>
        <button @click="goToPortal" class="btn-intellipath-primary w-full sm:w-auto" :disabled="portalLoading">
          <span v-if="portalLoading" class="animate-subtle-pulse">Opening Portal...</span>
          <span v-else>Manage Billing & Subscription</span>
        </button>
      </div>

      <!-- No Active Subscription State -->
      <div v-else class="space-y-6">
        <p class="text-lg text-slate-300 text-center">
          You currently do not have an active IntelliPath subscription.
        </p>
        
        <div class="border-2 border-slate-700 rounded-xl p-6 hover:border-sky-500/70 transition-colors duration-300 space-y-4 bg-slate-800/50">
          <div class="flex justify-between items-center">
            <h2 class="text-2xl font-semibold text-sky-400">IntelliPath Basic</h2>
            <span class="px-3 py-1 text-xs font-semibold text-teal-300 bg-teal-500/20 rounded-full border border-teal-600">Monthly</span>
          </div>
          <p class="text-4xl font-bold text-slate-100">
            $29 <span class="text-base font-normal text-slate-400">/ month</span>
          </p>
          <ul class="space-y-2 text-sm text-slate-300 pt-2">
            <li class="flex items-center"><svg class="w-4 h-4 mr-2 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>AI-Powered Dynamic Curriculums</li>
            <li class="flex items-center"><svg class="w-4 h-4 mr-2 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Up to 10 Active Employees</li>
            <li class="flex items-center"><svg class="w-4 h-4 mr-2 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Basic Analytics & Reporting</li>
          </ul>
          <button @click="subscribe(basicPlanPriceId)" class="btn-intellipath-primary w-full mt-4 !py-3" :disabled="isSubscribeDisabled">
            <span v-if="checkoutLoading" class="animate-subtle-pulse">Processing...</span>
            <span v-else>Choose Basic Plan</span>
          </button>
        </div>
      </div>

      <p class="mt-4 text-center text-xs text-slate-500">
        Payments are securely processed by our partner, Stripe.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthStore } from '../stores/authStore';
import stripeService from '../services/stripeService';  

const authStore = useAuthStore();
const portalLoading = ref(false);
const portalError = ref(null);
const checkoutLoading = ref(false);
const checkoutError = ref(null);
const initialLoadComplete = ref(false); 

const basicPlanPriceId = ref(import.meta.env.VITE_STRIPE_BASIC_PLAN_PRICE_ID || '');

const isSubscribeDisabled = computed(() => {
  return checkoutLoading.value || !basicPlanPriceId.value; // Button disabled if no Price ID
});

onMounted(async () => {
  if (!import.meta.env.VITE_STRIPE_BASIC_PLAN_PRICE_ID) {
    console.warn("SubscriptionView: VITE_STRIPE_BASIC_PLAN_PRICE_ID is not defined in your .env.local file or build environment. Subscription button will be disabled if not hardcoded.");
    if (!basicPlanPriceId.value) {
        checkoutError.value = "Subscription plan ID is not configured. Please contact support.";
    }
  } else if (basicPlanPriceId.value === '') {
      console.warn("SubscriptionView: VITE_STRIPE_BASIC_PLAN_PRICE_ID is defined but empty. Subscription button will be disabled.");
      checkoutError.value = "Subscription plan configuration error. Please contact support.";
  }
  
  // Fetch current user and subscription status
  // (This logic was in the full script version, ensure it's what you want)
  if (!authStore.user || authStore.subscriptionStatus === null || authStore.subscriptionStatus === 'inactive') {
    // Prioritize fetching user if not present, as it includes subscription status
    await authStore.checkAuthStatus(); 
  } else if (authStore.isAuthenticated) {
    // If user is present but status might be stale (e.g. user just came from success page but reloaded this one)
    await authStore.updateSubscriptionStatus();
  }
  initialLoadComplete.value = true; // From previous full script
});

const subscribe = async () => { // Removed priceId argument, will use basicPlanPriceId.value
  checkoutLoading.value = true;
  checkoutError.value = null;
  portalError.value = null;

  if (!basicPlanPriceId.value) {
      // This alert is more for developers during setup
      // alert("Developer: VITE_STRIPE_BASIC_PLAN_PRICE_ID is not set in the frontend .env file or is empty.");
      checkoutError.value = "Subscription plan is currently unavailable. Please try again later or contact support.";
      checkoutLoading.value = false;
      return;
  }
  try {
    await stripeService.createCheckoutSession(basicPlanPriceId.value); // Use the ref's value
  } catch (error) {
    console.error("SubscriptionView subscribe error:", error);
    checkoutError.value = error.response?.data?.message || error.message || "Failed to initiate subscription. Please check your connection and try again.";
  } finally {
    // redirectToCheckout usually means this won't be hit if successful
    checkoutLoading.value = false; 
  }
};

const goToPortal = async () => {
  portalLoading.value = true;
  portalError.value = null;
  checkoutError.value = null;
  try {
    await stripeService.createPortalSession();
  } catch (error) {
    console.error("SubscriptionView goToPortal error:", error);
    portalError.value = error.response?.data?.message || error.message || "Failed to open customer portal. Please try again later.";
  } finally {
    portalLoading.value = false;
  }
};
</script>