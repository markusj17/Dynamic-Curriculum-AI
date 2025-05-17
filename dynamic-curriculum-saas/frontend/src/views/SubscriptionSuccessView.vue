<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-900 text-center">
    <div class="card-intellipath max-w-lg p-8 md:p-10">
      <div class="text-6xl mb-4 text-emerald-400">🎉</div>
      <h1 class="text-3xl font-bold text-slate-100 mb-4">Subscription Successful!</h1>
      <p v-if="isLoading" class="text-slate-300 animate-pulse mb-6">
        Finalizing your account details...
      </p>
      <p v-else class="text-slate-300 mb-6">
        Thank you for subscribing to IntelliPath! Your access has been activated.
      </p>
      <router-link to="/dashboard" class="btn-intellipath-primary">
        Go to Dashboard
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '../stores/authStore';

const route = useRoute();
const authStore = useAuthStore();
const isLoading = ref(true);

onMounted(async () => {
  console.log("SubscriptionSuccessView: Mounted.");
  authStore.setSubscriptionSuccess(); 
  
  try {
    await authStore.updateSubscriptionStatus(); 
    console.log("SubscriptionSuccessView: Subscription status updated from backend.");
  } catch (error) {
    console.error("SubscriptionSuccessView: Error updating subscription status:", error);
  } finally {
    isLoading.value = false;
  }

  const sessionId = route.query.session_id;
  if (sessionId) {
    console.log("Stripe Checkout Session ID from URL:", sessionId);

  }
});
</script>