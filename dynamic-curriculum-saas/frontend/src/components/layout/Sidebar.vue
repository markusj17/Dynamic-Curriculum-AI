<template>
  <aside v-if="authStore.isAuthenticated" class="w-64 bg-slate-800/60 backdrop-blur-md p-4 space-y-2 hidden md:block print:hidden">
    <router-link
      to="/dashboard"
      class="sidebar-link"
      active-class="sidebar-link-active"
    >
      <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
      Dashboard
    </router-link>
    <router-link
      v-if="authStore.isLdManager"
      to="/employees"
      class="sidebar-link"
      active-class="sidebar-link-active"
    >
      <svg class="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
      Employees
    </router-link>
  </aside>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore';
const authStore = useAuthStore();
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center text-slate-300 hover:bg-slate-700 hover:text-sky-300 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150;
}
.sidebar-link-active {
  @apply bg-sky-500/20 text-sky-300 border-l-4 border-sky-400;
}
</style>