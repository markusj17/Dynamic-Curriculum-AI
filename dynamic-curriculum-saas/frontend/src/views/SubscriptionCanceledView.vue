<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-900 via-red-900 to-orange-900 text-slate-200 text-center">
    <div class="card-intellipath max-w-lg p-8 md:p-12 space-y-6">
      <div>
        <svg class="mx-auto h-16 w-16 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <h1 class="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
        Subscription Canceled
      </h1>
      <p class="text-slate-300 leading-relaxed">
        Your subscription process was not completed or has been canceled. You can try subscribing again or contact support if you faced any issues.
      </p>
      <div class="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4">
        <router-link to="/subscription" class="btn-intellipath-secondary !px-8 !py-3 text-lg w-full sm:w-auto">
          Retry Subscription
        </router-link>
        <router-link to="/dashboard" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
          Go to Dashboard
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
</script>