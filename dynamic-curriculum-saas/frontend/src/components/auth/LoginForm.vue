<template>
  <div class="w-full max-w-md space-y-6">
    <div class="text-center">
      <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-12 w-auto mb-4" />
      <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        Welcome to IntelliPath
      </h2>
      <p class="mt-2 text-sm text-slate-400">
        Unlock your potential. Sign in to continue.
      </p>
    </div>

    <form @submit.prevent="handleLogin" class="card-intellipath p-8 md:p-10 space-y-6">
      <div>
        <label for="email" class="sr-only">Email address</label>
        <input
          id="email"
          v-model="email"
          name="email"
          type="email"
          autocomplete="email"
          required
          class="input-field-intellipath"
          placeholder="Email address"
        />
      </div>

      <div>
        <label for="password" class="sr-only">Password</label>
        <input
          id="password"
          v-model="password"
          name="password"
          type="password"
          autocomplete="current-password"
          required
          class="input-field-intellipath"
          placeholder="Password"
        />
      </div>

      <div class="flex items-center justify-between text-sm">
        <div class="flex items-center">
          <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-slate-600 bg-slate-700 text-sky-500 focus:ring-sky-600 focus:ring-offset-slate-900" />
          <label for="remember-me" class="ml-2 block text-slate-400">Remember me</label>
        </div>
        <a href="#" class="font-medium text-sky-500 hover:text-sky-400 transition-colors duration-200">Forgot password?</a>
      </div>

      <div>
        <button
          type="submit"
          :disabled="authStore.isLoading"
          class="btn-intellipath-primary w-full group"
        >
          <span class="absolute inset-0 overflow-hidden rounded-lg">
            <span class="absolute inset-0 _translate-x-[-100%]_rotate-[-25deg]_bg-white/10_transition-all_duration-700_ease-in-out_group-hover:translate-x-[100%]"></span>
          </span>
          <span class="relative">
            <span v-if="authStore.isLoading" class="animate-subtle-pulse">Processing...</span>
            <span v-else>Sign In</span>
          </span>
        </button>
      </div>
      <p v-if="authStore.error" class="text-sm text-red-400 text-center pt-2">{{ authStore.error }}</p>
    </form>

    <p class="text-center text-sm text-slate-400">
      New to IntelliPath?
      <router-link to="/signup" class="font-medium text-sky-500 hover:text-sky-400 transition-colors duration-200">
        Create an account
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../stores/authStore'; 
import { useRouter, useRoute } from 'vue-router';

import logoUrl from '../../assets/intellipath-logo.png';

const email = ref('');
const password = ref('');
const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

const handleLogin = async () => {
  const success = await authStore.login({ email: email.value, password: password.value });
  if (success) {
    const redirectPath = route.query.redirect || '/dashboard';
    router.push(redirectPath);
  }
};
</script>

<style scoped>
.btn-intellipath-primary .absolute.inset-0_translate-x-\[-100\%\]_rotate-\[-25deg\]_bg-white\/10_transition-all_duration-700_ease-in-out_group-hover\:translate-x-\[100\%\] {
 
}
</style>