<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-emerald-800 to-teal-900 text-slate-200 text-center">
    <div class="card-intellipath max-w-lg p-8 md:p-12 space-y-6">
      <div>
        <svg class="mx-auto h-16 w-16 text-emerald-400 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
        Subscription Activated!
      </h1>
      <p v-if="isLoading" class="text-slate-300 animate-pulse">
        Finalizing your account details...
      </p>
      <p v-else class="text-slate-300 leading-relaxed">
        Thank you for subscribing to IntelliPath! Your access has been enabled, and you can now explore your personalized learning dashboard.
      </p>
      <div>
        <router-link to="/dashboard" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
          Go to Dashboard
        </router-link>
      </div>
      <p v-if="sessionId" class="text-xs text-slate-500 pt-4">
        Session ID: {{ sessionId }}
      </p>
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
const sessionId = ref(route.query.session_id || '');

onMounted(async () => {
  authStore.setSubscriptionSuccess();
  try {
    await authStore.updateSubscriptionStatus();
  } catch (error) {
    console.error("SubscriptionSuccessView: Error updating subscription status:", error);
  } finally {
    isLoading.value = false;
  }
});
</script>