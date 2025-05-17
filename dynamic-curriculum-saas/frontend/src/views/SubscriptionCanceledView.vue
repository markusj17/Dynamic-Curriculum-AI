<template>
  <div class="container mx-auto p-4 md:p-8 text-center">
    <div class="card max-w-lg mx-auto my-10">
      <div class="text-6xl mb-4 text-orange-500">😕</div>
      <h1 class="text-3xl font-bold text-gray-800 mb-4">Subscription Canceled</h1>
      <p class="text-gray-600 mb-6">
        Your subscription process was canceled or was not completed.
      </p>
      <p class="text-gray-600 mb-6">
        If you faced any issues, please try again or contact support.
      </p>
      <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <router-link to="/subscription" class="btn btn-secondary w-full sm:w-auto">
          Retry Subscription
        </router-link>
        <router-link to="/dashboard" class="btn btn-primary w-full sm:w-auto">
          Go to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>

</script>

<style scoped>
.card {
  @apply bg-white shadow-xl rounded-lg p-6 md:p-8;
}
</style>