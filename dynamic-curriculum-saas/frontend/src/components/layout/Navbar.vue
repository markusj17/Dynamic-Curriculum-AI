<template>
  <nav v-if="authStore.isAuthenticated" class="bg-slate-800/80 backdrop-blur-md shadow-lg sticky top-0 z-40">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between h-16">
        <div class="flex items-center">
          <router-link to="/dashboard" class="flex-shrink-0 flex items-center space-x-2">
            <img class="h-8 w-auto" :src="logoUrl" alt="IntelliPath Logo" />
            <span class="text-xl font-semibold text-sky-400">IntelliPath</span>
          </router-link>
        </div>
        <div class="hidden md:block">
          <div class="ml-10 flex items-baseline space-x-4">
            <router-link
              to="/dashboard"
              class="nav-link"
              active-class="nav-link-active"
            >Dashboard</router-link>
            <router-link
              to="/employees"
              v-if="authStore.isLdManager"
              class="nav-link"
              active-class="nav-link-active"
            >Employees</router-link>
             <router-link
              to="/subscription"
              class="nav-link"
              active-class="nav-link-active"
            >Subscription</router-link>
          </div>
        </div>
        <div class="flex items-center">
          <div v-if="authStore.user" class="mr-3 text-sm text-slate-400 hidden sm:block">
            {{ authStore.user.email }}
          </div>
          <button
            @click="logout"
            class="btn-intellipath-secondary !px-3 !py-1.5 text-sm"
          >
            Logout
          </button>
          <div class="-mr-2 flex md:hidden ml-2">
            <button type="button" @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white" aria-controls="mobile-menu" aria-expanded="false">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="mobileMenuOpen" class="md:hidden" id="mobile-menu">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <router-link to="/dashboard" class="nav-link-mobile" active-class="nav-link-active-mobile">Dashboard</router-link>
        <router-link v-if="authStore.isLdManager" to="/employees" class="nav-link-mobile" active-class="nav-link-active-mobile">Employees</router-link>
        <router-link to="/subscription" class="nav-link-mobile" active-class="nav-link-active-mobile">Subscription</router-link>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore'; 
import logoUrl from '../../assets/intellipath-logo.png'; 

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

const logout = () => {
  authStore.logout();
};
</script>

<style scoped>
.nav-link {
  @apply text-slate-300 hover:bg-slate-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors;
}
.nav-link-active {
  @apply bg-sky-500 text-white;
}
.nav-link-mobile {
  @apply text-slate-300 hover:bg-slate-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium transition-colors;
}
.nav-link-active-mobile {
   @apply bg-sky-500 text-white;
}
</style>