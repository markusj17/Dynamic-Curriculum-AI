<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-900">
    <!-- Optional: Animated background elements (can be same or similar to other auth views) -->
    <div class="absolute inset-0 z-0 opacity-30">
      <div class="absolute top-[-20%] left-[-20%] w-[60vw] h-[60vw] bg-gradient-radial from-teal-700/40 via-transparent to-transparent rounded-full animate-pulse-slow delay-500"></div>
      <div class="absolute bottom-[-20%] right-[-20%] w-[70vw] h-[70vw] bg-gradient-radial from-indigo-700/30 via-transparent to-transparent rounded-full animate-pulse-slower delay-1500"></div>
    </div>

    <!-- Employee Login Form Component (can be inline or a separate component) -->
    <div class="w-full max-w-md space-y-6 z-10">
      <div class="text-center">
        <router-link to="/">
          <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-12 w-auto mb-4" />
        </router-link>
        <h2 class="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          Employee Portal
        </h2>
        <p class="mt-2 text-sm text-slate-400">
          Access your personalized learning path.
        </p>
      </div>

      <form @submit.prevent="handleEmployeeLogin" class="card-intellipath p-8 md:p-10 space-y-6">
        <div>
          <label for="username" class="sr-only">Username</label>
          <input
            id="username"
            v-model="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            class="input-field-intellipath"
            placeholder="Username"
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
        
        <!-- Optional: Company Code if usernames are not globally unique
        <div>
          <label for="companyCode" class="sr-only">Company Code (if provided)</label>
          <input id="companyCode" v-model="companyCode" name="companyCode" type="text" class="input-field-intellipath" placeholder="Company Code (Optional)" />
        </div>
        -->

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
              <span v-if="authStore.isLoading" class="animate-subtle-pulse">Signing In...</span>
              <span v-else>Sign In</span>
            </span>
          </button>
        </div>
        <p v-if="authStore.error" class="text-sm text-red-400 text-center pt-2">{{ authStore.error }}</p>
      </form>

      <p class="text-center text-sm text-slate-400">
        L&D Manager? 
        <router-link to="/login" class="font-medium text-sky-500 hover:text-sky-400 transition-colors duration-200">
          Admin Login
        </router-link>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import logoUrl from '../assets/intellipath-logo.png'; // Adjust path if needed

const username = ref('');
const password = ref('');
// const companyCode = ref(''); // Uncomment if you implement company codes
const authStore = useAuthStore();
const router = useRouter();

const handleEmployeeLogin = async () => {
  authStore.error = null; // Clear previous errors
  const success = await authStore.loginEmployee({
    username: username.value,
    password: password.value,
    // companyCode: companyCode.value, // Send if using company codes
  });

  if (success && authStore.currentUser) {
    // Redirect to their specific learning path
    // authStore.currentUser._id should be the employeeId after successful employee login
    router.push({ name: 'EmployeeLearningPath', params: { employeeId: authStore.currentUser._id } });
  } else {
    // Error message is already set by authStore.error and displayed in template
    console.error("EmployeeLoginView: Login call to store failed or currentUser not set.");
  }
};
</script>

<style scoped>
/* Keyframes for background animations can be in index.css or here if specific */
@keyframes pulse-slow { /* ... */ }
@keyframes pulse-slower { /* ... */ }
.animate-pulse-slow { animation: pulse-slow 15s infinite ease-in-out; }
.animate-pulse-slower { animation: pulse-slower 20s infinite ease-in-out; }
.bg-gradient-radial { background-image: radial-gradient(ellipse at center, var(--tw-gradient-stops)); }
.delay-500 { animation-delay: 0.5s; }
.delay-1500 { animation-delay: 1.5s; }
</style>