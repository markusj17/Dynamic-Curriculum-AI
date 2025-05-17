<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900">
    <div class="w-full max-w-lg space-y-6">
      <div class="text-center mb-8">
        <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-10 w-auto mb-3" />
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          Subscription Management
        </h1>
        <p class="mt-2 text-sm text-slate-400">Manage your IntelliPath access plan.</p>
      </div>

      <div v-if="authStore.isLoading" class="card-intellipath p-8 text-center">
        <p class="text-slate-300 animate-pulse">Loading subscription details...</p>
      </div>

      <div v-else class="card-intellipath p-6 md:p-8 space-y-6">
        <div v-if="authStore.error" class="bg-red-500/20 text-red-300 p-4 rounded-lg text-sm mb-4">
          <p><span class="font-semibold">Error:</span> {{ authStore.error }}</p>
        </div>

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
          <button @click="goToPortal" class="btn-intellipath-primary w-full" :disabled="portalLoading">
            <span v-if="portalLoading" class="animate-subtle-pulse">Opening Portal...</span>
            <span v-else>Manage Billing & Subscription</span>
          </button>
          <p v-if="portalError" class="text-red-400 text-xs mt-2">{{ portalError }}</p>
        </div>

        <div v-else class="space-y-6">
          <p class="text-lg text-slate-300 text-center">
            You currently do not have an active IntelliPath subscription.
          </p>
          
          <div class="border-2 border-slate-700 rounded-xl p-6 hover:border-sky-500 transition-colors duration-300 space-y-4">
            <div class="flex justify-between items-center">
              <h2 class="text-2xl font-semibold text-sky-400">IntelliPath Basic</h2>
              <span class="px-3 py-1 text-xs font-semibold text-teal-300 bg-teal-500/20 rounded-full">Monthly</span>
            </div>
            <p class="text-3xl font-bold text-slate-100">
              $29 <span class="text-base font-normal text-slate-400">/ month</span>
            </p>
            <ul class="space-y-2 text-sm text-slate-400">
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                AI-Powered Dynamic Curriculums
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Up to 10 Active Employees
              </li>
              <li class="flex items-center">
                <svg class="w-4 h-4 mr-2 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>
                Basic Analytics & Reporting
              </li>
            </ul>
            <button @click="subscribe(basicPlanPriceId)" class="btn-intellipath-primary w-full mt-3" :disabled="checkoutLoading">
              <span v-if="checkoutLoading" class="animate-subtle-pulse">Processing...</span>
              <span v-else>Choose Basic Plan</span>
            </button>
          </div>
          <p v-if="checkoutError" class="text-red-400 text-xs mt-2 text-center">{{ checkoutError }}</p>
        </div>

        <p class="mt-6 text-center text-xs text-slate-500">
          Payments are securely processed by our partner, Stripe.
        </p>
      </div>

      <div class="text-center mt-4">
          <router-link to="/dashboard" class="text-sm text-sky-500 hover:text-sky-400 hover:underline transition-colors duration-200">
            ← Back to Dashboard
          </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import stripeService from '../services/stripeService'; 
import logoUrl from '../assets/intellipath-logo.png'; 

const authStore = useAuthStore();
const portalLoading = ref(false);
const portalError = ref(null);
const checkoutLoading = ref(false);
const checkoutError = ref(null);

const basicPlanPriceId = 'price_1RPVmb03EWky4HijnDXmtvwY'; 

onMounted(async () => {
  if (!authStore.user || authStore.subscriptionStatus === null) {
    await authStore.checkAuthStatus();
  } else if (authStore.isAuthenticated) {
    await authStore.updateSubscriptionStatus();
  }
});

const subscribe = async (priceId) => {
  checkoutLoading.value = true;
  checkoutError.value = null;
  if (priceId === 'prod_SKA6w6b6OxajlX' && basicPlanPriceId.includes('YOUR_ACTUAL')) { // Basic check
      alert("Developer: Please replace 'price_YOUR_ACTUAL_BASIC_PLAN_PRICE_ID' with your actual Stripe Price ID in SubscriptionView.vue");
      checkoutError.value = "Stripe Price ID not configured.";
      checkoutLoading.value = false;
      return;
  }
  try {
    await stripeService.createCheckoutSession(priceId);
  } catch (error) {
    console.error("Subscription error:", error);
    checkoutError.value = error.response?.data?.message || error.message || "Failed to initiate subscription.";
  } finally {
    checkoutLoading.value = false;
  }
};

const goToPortal = async () => {
  portalLoading.value = true;
  portalError.value = null;
  try {
    await stripeService.createPortalSession();
  } catch (error) {
    console.error("Portal error:", error);
    portalError.value = error.response?.data?.message || error.message || "Failed to open customer portal.";
  } finally {
    portalLoading.value = false;
  }
};
</script>
