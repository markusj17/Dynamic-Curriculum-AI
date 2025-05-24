<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center text-center p-4 bg-gradient-to-br from-slate-900 via-indigo-800 to-purple-900 text-slate-200">
    <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-12 w-auto mb-6 opacity-80" />
    <h1 class="text-8xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300 drop-shadow-lg">404</h1>
    <p class="text-3xl font-semibold text-slate-100 mt-4">Page Not Found</p>
    <p class="text-slate-300/80 mt-3 max-w-md">
      Oops! The page you are looking for doesn't exist, might have been removed, or is temporarily unavailable.
    </p>
    <div class="mt-10">
      <router-link to="/" class="btn-intellipath-primary !px-8 !py-3 text-lg">
        Go Back Home
      </router-link>
    </div>
  </div>
</template>

<script setup>
import logoUrl from '../assets/intellipath-logo.png';
</script>