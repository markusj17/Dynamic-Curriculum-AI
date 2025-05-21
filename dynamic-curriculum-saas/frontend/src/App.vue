<template>
  <div id="app-container" class="flex flex-col min-h-screen">
    <Navbar v-if="shouldShowAppShell" />

    <div class="flex flex-1" :class="{ 'pt-16': shouldShowAppShell }"> 
      <Sidebar v-if="shouldShowAppShell" />

      <main class="flex-1 overflow-y-auto" :class="{ 'md:ml-64': shouldShowAppShell }">
        <router-view v-slot="{ Component, route }">
          <Transition :name="route.meta.transitionName || 'fade'" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Navbar from './components/layout/Navbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();
const route = useRoute();
const isAuthCheckComplete = ref(false);

const shouldShowAppShell = computed(() => {
  if (!isAuthCheckComplete.value) return false; 

  const fullPageRoutes = ['Landing', 'Login', 'Signup', 'NotFound', 'Contact', 'PrivacyPolicy', 'TermsOfService'];
  
  if (!authStore.isAuthenticated) return false;
  
  return !fullPageRoutes.includes(route.name);
});

onMounted(async () => {
  await authStore.checkAuthStatus();
  isAuthCheckComplete.value = true;
});
</script>

<style>
/* Global page transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Reset html, body for full height consistency */
html, body, #app, #app-container {
  min-height: 100vh;
  height: 100%; /* Can sometimes cause issues with nested scrollbars if not careful with children */
  margin: 0;
  padding: 0;
}
</style>