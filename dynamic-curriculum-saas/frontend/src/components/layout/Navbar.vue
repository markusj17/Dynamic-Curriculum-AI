<template>
  <nav class="bg-slate-800/75 backdrop-blur-lg shadow-xl fixed top-0 left-0 right-0 z-40 h-16 transition-all duration-300 ease-in-out">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-screen-2xl">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and Brand Name - Now links to Landing Page "/" -->
        <router-link to="/" class="flex-shrink-0 flex items-center space-x-2 group">
          <img class="h-8 w-auto group-hover:opacity-80 transition-opacity" :src="logoUrl" alt="IntelliPath Logo" />
          <span class="hidden sm:block text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">IntelliPath</span>
        </router-link>

        <!-- Desktop Navigation Links (for authenticated app sections) -->
        <div class="hidden md:flex items-baseline space-x-1 lg:space-x-2">
          <router-link to="/dashboard" class="app-nav-link" active-class="app-nav-link-active">
            <svg class="w-5 h-5 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </router-link>
          <router-link v-if="authStore.isLdManager" to="/employees" class="app-nav-link" active-class="app-nav-link-active">
             <svg class="w-5 h-5 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            Employees
          </router-link>
          <router-link to="/subscription" class="app-nav-link" active-class="app-nav-link-active">
            <svg class="w-5 h-5 mr-1.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
            Subscription
          </router-link>
        </div>

        <!-- User Info and Logout -->
        <div class="flex items-center space-x-3">
          <span class="text-sm text-slate-400 hidden lg:block truncate max-w-[150px]" :title="authStore.user?.email">
            {{ authStore.user?.email }}
          </span>
          <button @click="handleLogout" title="Logout" class="p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>

          <!-- Mobile Menu Button -->
          <div class="flex md:hidden">
            <button type="button" @click="toggleMobileMenu" class="p-2 rounded-md text-slate-300 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" :aria-expanded="mobileMenuOpen.toString()">
              <span class="sr-only">Open menu</span>
              <svg v-if="!mobileMenuOpen" class="block h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg v-else class="block h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu Content for App -->
    <Transition enter-active-class="transition ease-out duration-200 origin-top" enter-from-class="opacity-0 scale-y-95" enter-to-class="opacity-100 scale-y-100" leave-active-class="transition ease-in duration-150 origin-top" leave-from-class="opacity-100 scale-y-100" leave-to-class="opacity-0 scale-y-95">
      <div v-if="mobileMenuOpen" class="md:hidden bg-slate-800 shadow-lg absolute w-full top-16 left-0 rounded-b-md z-30">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link @click="closeMobileMenu" to="/dashboard" class="app-nav-link-mobile" active-class="app-nav-link-active-mobile">Dashboard</router-link>
          <router-link @click="closeMobileMenu" v-if="authStore.isLdManager" to="/employees" class="app-nav-link-mobile" active-class="app-nav-link-active-mobile">Employees</router-link>
          <router-link @click="closeMobileMenu" to="/subscription" class="app-nav-link-mobile" active-class="app-nav-link-active-mobile">Subscription</router-link>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
// ... (script setup remains the same)
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore';
import logoUrl from '../../assets/intellipath-logo.png';

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

const toggleMobileMenu = () => mobileMenuOpen.value = !mobileMenuOpen.value;
const closeMobileMenu = () => mobileMenuOpen.value = false;

const handleLogout = () => {
  closeMobileMenu();
  authStore.logout();
};
</script>

<style scoped>
/* ... (styles remain the same) ... */
.app-nav-link {
  @apply flex items-center text-slate-300 hover:bg-slate-700/50 hover:text-sky-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ease-in-out;
}
.app-nav-link-active {
  @apply bg-sky-600/30 text-sky-200 font-semibold;
}
.app-nav-link-mobile {
  @apply block text-slate-200 hover:bg-slate-700 hover:text-sky-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150;
}
.app-nav-link-active-mobile {
   @apply bg-sky-500/80 text-white;
}
</style>