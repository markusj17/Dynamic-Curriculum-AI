<template>
  <div class="w-full max-w-md space-y-6">
    <div class="text-center">
      <router-link to="/">
        <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-12 w-auto mb-4" />
      </router-link>
      <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        Create Your IntelliPath Account
      </h2>
      <p class="mt-2 text-sm text-slate-400">
        Start your journey towards smarter L&D today.
      </p>
    </div>

    <form @submit.prevent="handleSignup" class="card-intellipath p-8 md:p-10 space-y-6">
      <div>
        <label for="companyName" class="sr-only">Company Name</label>
        <input
          id="companyName"
          v-model="companyName"
          name="companyName"
          type="text"
          autocomplete="organization"
          required
          class="input-field-intellipath"
          placeholder="Company Name"
        />
      </div>

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
          autocomplete="new-password"
          required
          class="input-field-intellipath"
          placeholder="Password (min. 8 characters)"
        />
      </div>
      
      <div>
        <label for="confirmPassword" class="sr-only">Confirm Password</label>
        <input
          id="confirmPassword"
          v-model="confirmPassword"
          name="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
          class="input-field-intellipath"
          placeholder="Confirm Password"
        />
      </div>


      <div>
        <button
          type="submit"
          :disabled="authStore.isLoading || !passwordsMatch || password.length < 8"
          class="btn-intellipath-primary w-full group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span class="absolute inset-0 overflow-hidden rounded-lg">
            <span class="absolute inset-0 _translate-x-[-100%]_rotate-[-25deg]_bg-white/10_transition-all_duration-700_ease-in-out_group-hover:translate-x-[100%]"></span>
          </span>
          <span class="relative">
            <span v-if="authStore.isLoading" class="animate-subtle-pulse">Creating Account...</span>
            <span v-else>Sign Up</span>
          </span>
        </button>
      </div>
      <div v-if="!passwordsMatch && confirmPassword" class="text-xs text-red-400 text-center">
        Passwords do not match.
      </div>
       <div v-if="password && password.length < 8 && confirmPassword" class="text-xs text-red-400 text-center">
        Password must be at least 8 characters long.
      </div>
      <p v-if="authStore.error" class="text-sm text-red-400 text-center pt-2">{{ authStore.error }}</p>
    </form>

    <p class="text-center text-sm text-slate-400">
      Already have an account?
      <router-link to="/login" class="font-medium text-sky-500 hover:text-sky-400 transition-colors duration-200">
        Sign In
      </router-link>
    </p>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useAuthStore } from '../../stores/authStore'; // Adjust path if needed
import { useRouter } from 'vue-router';
import logoUrl from '../../assets/intellipath-logo.png'; // Adjust path

const companyName = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref(''); // Added for password confirmation
const authStore = useAuthStore();
const router = useRouter();

const passwordsMatch = computed(() => password.value === confirmPassword.value);

const handleSignup = async () => {
  authStore.error = null; // Clear previous errors
  if (!passwordsMatch.value) {
    authStore.error = 'Passwords do not match.';
    return;
  }
  if (password.value.length < 8) {
    authStore.error = 'Password must be at least 8 characters long.';
    return;
  }

  const success = await authStore.register({
    companyName: companyName.value,
    email: email.value,
    password: password.value,
  });

  if (success) {
    console.log("Signup successful, authStore will handle navigation.");
  }
};
</script>

<style scoped>

</style>