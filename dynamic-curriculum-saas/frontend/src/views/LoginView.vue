<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
    <div class="absolute inset-0 z-0 opacity-30">
      <div class="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-radial from-sky-600/40 via-transparent to-transparent rounded-full animate-pulse-slow"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-gradient-radial from-purple-600/30 via-transparent to-transparent rounded-full animate-pulse-slower"></div>
    </div>

    <LoginForm class="z-10" />
  </div>
</template>

<script setup>
import LoginForm from '../components/auth/LoginForm.vue';
</script>

<style>
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.4; }
}
@keyframes pulse-slower {
  0%, 100% { transform: scale(1); opacity: 0.2; }
  50% { transform: scale(1.05); opacity: 0.3; }
}
.animate-pulse-slow {
  animation: pulse-slow 15s infinite ease-in-out;
}
.animate-pulse-slower {
  animation: pulse-slower 20s infinite ease-in-out;
}
.bg-gradient-radial {
  background-image: radial-gradient(ellipse at center, var(--tw-gradient-stops));
}
</style>