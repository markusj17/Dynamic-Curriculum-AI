<template>
  <nav class="bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-40 print:hidden">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <!-- Logo and App Name -->
        <router-link to="/" class="flex-shrink-0 flex items-center space-x-2 group">
          <img class="h-8 w-auto group-hover:opacity-80 transition-opacity" :src="logoUrl" alt="IntelliPath Logo" />
          <span class="text-xl font-semibold text-sky-400 group-hover:text-sky-300 transition-colors">IntelliPath</span>
        </router-link>

        <!-- Desktop Menu -->
        <div class="hidden md:flex items-center space-x-2">
          <router-link to="/" class="nav-link" :class="{ 'nav-link-active': $route.name === 'Landing' }">Home</router-link>

          <template v-if="authStore.isAuthenticated">
            <router-link to="/dashboard" class="nav-link" :class="{ 'nav-link-active': $route.name === 'LDDashboard' }">Dashboard</router-link>
            <router-link to="/subscription" class="nav-link" :class="{ 'nav-link-active': $route.name === 'Subscription' }">Subscription</router-link>
            <!-- Add more authenticated links like Employees if isLdManager -->
            <router-link
              v-if="authStore.isLdManager"
              to="/employees"
              class="nav-link"
              :class="{ 'nav-link-active': $route.name && $route.name.startsWith('Employee') }"
            >Employees</router-link>
          </template>
          
          <!-- Links for legal pages -->
          <router-link to="/terms-of-service" class="nav-link">Terms</router-link>
          <router-link to="/privacy-policy" class="nav-link">Privacy</router-link>
        </div>

        <!-- Auth Buttons / User Info -->
        <div class="flex items-center">
          <template v-if="authStore.isAuthenticated">
            <div class="text-sm text-slate-400 mr-3 hidden sm:block truncate max-w-[150px]" :title="authStore.user?.email">
              {{ authStore.user?.email }}
            </div>
            <button @click="logout" class="btn-intellipath-secondary !px-3 !py-1.5 text-sm">
              Logout
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="nav-link !px-3 !py-1.5 text-sm mr-2">Login</router-link>
            <router-link to="/signup" class="btn-intellipath-primary !px-4 !py-1.5 text-sm">Sign Up</router-link>
          </template>

          <!-- Mobile Menu Button -->
          <div class="ml-2 flex md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md text-slate-300 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen.toString()">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Mobile Menu -->
    <Transition
      enter-active-class="transition ease-out duration-200 transform"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150 transform"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div v-if="mobileMenuOpen" class="md:hidden absolute w-full bg-slate-800 shadow-lg rounded-b-lg pb-3" id="mobile-menu">
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <router-link @click="mobileMenuOpen = false" to="/" class="nav-link-mobile" :class="{ 'nav-link-active-mobile': $route.name === 'Landing' }">Home</router-link>
          <template v-if="authStore.isAuthenticated">
            <router-link @click="mobileMenuOpen = false" to="/dashboard" class="nav-link-mobile" :class="{ 'nav-link-active-mobile': $route.name === 'LDDashboard' }">Dashboard</router-link>
            <router-link @click="mobileMenuOpen = false" to="/subscription" class="nav-link-mobile" :class="{ 'nav-link-active-mobile': $route.name === 'Subscription' }">Subscription</router-link>
            <router-link @click="mobileMenuOpen = false" v-if="authStore.isLdManager" to="/employees" class="nav-link-mobile" :class="{ 'nav-link-active-mobile': $route.name && $route.name.startsWith('Employee') }">Employees</router-link>
          </template>
          <router-link @click="mobileMenuOpen = false" to="/terms-of-service" class="nav-link-mobile">Terms</router-link>
          <router-link @click="mobileMenuOpen = false" to="/privacy-policy" class="nav-link-mobile">Privacy</router-link>
        </div>
      </div>
    </Transition>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore';
import logoUrl from '../../assets/intellipath-logo.png';

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

const logout = () => {
  mobileMenuOpen.value = false; 
  authStore.logout(); 
};
</script>

<style scoped>
.nav-link {
  @apply text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150;
}
.nav-link-active {
  @apply text-sky-400 bg-sky-500/10;
}
.nav-link-mobile {
  @apply block text-slate-200 hover:bg-slate-700 hover:text-sky-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150;
}
.nav-link-active-mobile {
   @apply bg-sky-500 text-white;
}
</style>