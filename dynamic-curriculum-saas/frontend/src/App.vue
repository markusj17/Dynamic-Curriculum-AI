<template>
  <div id="app-container" class="flex flex-col min-h-screen">
    <Navbar v-if="authStore.isAuthenticated && showNavAndSidebar" />
    <div class="flex flex-1">
      <Sidebar v-if="authStore.isAuthenticated && showNavAndSidebar" />
      <main class="flex-1 overflow-y-auto">
        <router-view v-slot="{ Component }">
          <Transition name="fade" mode="out-in">
            <component :is="Component" />
          </Transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'; 
import { useRoute } from 'vue-router';
import Navbar from './components/layout/Navbar.vue';
import Sidebar from './components/layout/Sidebar.vue';
import { useAuthStore } from './stores/authStore';

const authStore = useAuthStore();
const route = useRoute();

const showNavAndSidebar = computed(() => {
  return !['Login', 'Signup', 'Landing'].includes(route.name); 
});


onMounted(() => {
  authStore.checkAuthStatus();
});
</script>

<style>
html, body, #app, #app-container {
  min-height: 100vh;
  height: 100%;
  margin: 0;
  padding: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease-out;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>