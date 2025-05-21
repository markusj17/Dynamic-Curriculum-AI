<template>
  <header class="sticky top-0 z-30 w-full py-4 bg-slate-900/70 backdrop-blur-lg shadow-md">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <router-link to="/" class="flex items-center space-x-3 group">
        <img class="h-9 w-auto group-hover:opacity-80 transition-opacity" :src="logoUrl" alt="IntelliPath Logo" />
        <span class="text-2xl font-bold text-sky-400 group-hover:text-sky-300 transition-colors">IntelliPath</span>
      </router-link>
      <nav class="hidden md:flex items-center space-x-3 lg:space-x-5">
        <a href="/#features" @click.prevent="smoothScrollToSection('/#features')" class="landing-nav-link">Features</a>
        <a href="/#how-it-works" @click.prevent="smoothScrollToSection('/#how-it-works')" class="landing-nav-link">How It Works</a>
        <a href="/#pricing" @click.prevent="smoothScrollToSection('/#pricing')" class="landing-nav-link">Pricing</a>
        <router-link to="/contact" class="landing-nav-link">Contact</router-link>
      </nav>
      <div class="flex items-center space-x-3">
        <template v-if="authStore.isAuthenticated">
          <span class="text-sm text-slate-400 hidden lg:block truncate max-w-[150px]" :title="authStore.user?.email">
            {{ authStore.user?.email }}
          </span>
          <router-link v-if="authStore.hasActiveSubscription" to="/dashboard" class="btn-intellipath-secondary !px-4 !py-1.5 text-xs sm:text-sm">
            Dashboard
          </router-link>
          <router-link v-else to="/subscription" class="btn-intellipath-primary !px-4 !py-1.5 text-xs sm:text-sm">
            Activate Plan
          </router-link>
          <button @click="handleLogout" title="Logout" class="p-2 text-slate-400 hover:text-sky-400 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
          </button>
        </template>
        <template v-else>
          <router-link to="/login" class="text-slate-300 hover:text-sky-400 transition-colors px-3 py-2 text-xs sm:text-sm">Login</router-link>
          <router-link to="/signup" class="btn-intellipath-primary !px-4 !py-1.5 text-xs sm:text-sm">
            Sign Up Free
          </router-link>
        </template>
        <!-- Mobile Menu Button -->
        <div class="flex md:hidden">
          <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md text-slate-300 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" aria-controls="mobile-menu-landing" :aria-expanded="mobileMenuOpen.toString()">
            <span class="sr-only">Open main menu</span>
            <svg v-if="!mobileMenuOpen" class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
            <svg v-else class="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      </div>
    </div>
    <!-- Mobile Menu Content -->
    <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
      <div v-if="mobileMenuOpen" class="md:hidden bg-slate-800/90 backdrop-blur-sm rounded-b-lg shadow-xl md:absolute md:w-full md:left-0"> {/* Ensure it can take full width if needed on mobile */}
        <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <a @click="handleMobileNav('/#features')" href="/#features" class="landing-nav-link-mobile">Features</a>
          <a @click="handleMobileNav('/#how-it-works')" href="/#how-it-works" class="landing-nav-link-mobile">How It Works</a>
          <a @click="handleMobileNav('/#pricing')" href="/#pricing" class="landing-nav-link-mobile">Pricing</a>
          <router-link @click="mobileMenuOpen = false" to="/contact" class="landing-nav-link-mobile">Contact</router-link>
        </div>
      </div>
    </Transition>
  </header>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../stores/authStore'; // Adjust path as necessary
import logoUrl from '../../assets/intellipath-logo.png'; // Adjust path as necessary

const authStore = useAuthStore();
const router = useRouter();
const mobileMenuOpen = ref(false);

const handleLogout = () => {
  mobileMenuOpen.value = false;
  authStore.logout();
};

const smoothScrollToSection = (pathWithHash) => {
  const [path, hash] = pathWithHash.split('#');
  if (router.currentRoute.value.path !== path && path) { // If not on landing page, navigate first
    router.push(path).then(() => {
      if (hash) scrollToHash(hash);
    });
  } else if (hash) { // Already on landing page, just scroll
    scrollToHash(hash);
  }
  mobileMenuOpen.value = false;
};

const handleMobileNav = (pathWithHash) => {
    smoothScrollToSection(pathWithHash);
};

const scrollToHash = (hash) => {
  const targetElement = document.querySelector(`#${hash}`);
  if (targetElement) {
    const headerOffset = 70; // Height of your sticky header
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }
};
</script>

<style scoped>
.landing-nav-link {
  @apply text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150;
}
.landing-nav-link-mobile {
  @apply block text-slate-200 hover:bg-slate-700 hover:text-sky-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150;
}
</style>