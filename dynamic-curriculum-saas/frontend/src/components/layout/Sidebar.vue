<template>
  <aside class="w-64 bg-slate-800/80 backdrop-blur-md fixed left-0 top-16 bottom-0 z-30
                 overflow-y-auto p-4 space-y-1.5 hidden md:flex flex-col print:hidden
                 border-r border-slate-700/50">
    <nav class="flex-grow">
      <router-link to="/dashboard" class="sidebar-link group" active-class="sidebar-link-active">
        <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
        Dashboard
      </router-link>
      <router-link v-if="authStore.isLdManager" to="/employees" class="sidebar-link group" active-class="sidebar-link-active">
        <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        Manage Employees
      </router-link>
      <router-link to="/subscription" class="sidebar-link group" active-class="sidebar-link-active">
        <svg class="sidebar-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
        Subscription
      </router-link>
      <!-- Add other sidebar links like Settings, Profile etc. -->
    </nav>
    <!-- Optional: Footer element in sidebar -->
    <!-- 
    <div class="mt-auto pt-4 border-t border-slate-700/50">
      <p class="text-xs text-slate-500 text-center">© {{ new Date().getFullYear() }} IntelliPath</p>
    </div> 
    -->
  </aside>
</template>

<script setup>
import { useAuthStore } from '../../stores/authStore';
const authStore = useAuthStore();
</script>

<style scoped>
.sidebar-link {
  @apply flex items-center text-slate-300 hover:bg-slate-700/60 hover:text-sky-300 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ease-in-out;
}
.sidebar-link-active {
  @apply bg-sky-600/30 text-sky-200 font-semibold border-l-4 border-sky-400 pl-[calc(0.75rem-4px)];
}
.sidebar-icon {
 @apply h-5 w-5 mr-3 text-slate-400 group-hover:text-sky-300 transition-colors duration-150 ease-in-out shrink-0; /* Added shrink-0 */
}
.sidebar-link-active .sidebar-icon { /* Target icon within active link */
  @apply text-sky-300;
}
</style>