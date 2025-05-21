<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-slate-200 overflow-x-hidden">
    <LandingPageHeader />

    <main class="py-16 md:py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="max-w-2xl mx-auto text-center">
          <h1 class="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            Get In Touch
          </h1>
          <p class="mt-4 text-lg text-slate-300/90">
            We'd love to hear from you! Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
          </p>
        </div>

        <div class="mt-12 max-w-xl mx-auto">
          <form @submit.prevent="handleSubmitContactForm" class="card-intellipath p-8 space-y-6">
             <div>
              <label for="name" class="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" name="name" id="name" v-model="contactForm.name" required class="input-field-intellipath" />
            </div>
            <div>
              <label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
              <input type="email" name="email" id="email" v-model="contactForm.email" required class="input-field-intellipath" />
            </div>
            <div>
              <label for="company" class="block text-sm font-medium text-slate-300 mb-1">Company Name (Optional)</label>
              <input type="text" name="company" id="company" v-model="contactForm.company" class="input-field-intellipath" />
            </div>
            <div>
              <label for="message" class="block text-sm font-medium text-slate-300 mb-1">Message</label>
              <textarea name="message" id="message" rows="4" v-model="contactForm.message" required class="input-field-intellipath"></textarea>
            </div>
            <div>
              <button type="submit" class="btn-intellipath-primary w-full" :disabled="isSubmitting">
                <span v-if="isSubmitting" class="animate-subtle-pulse">Sending...</span>
                <span v-else>Send Message</span>
              </button>
            </div>
            <p v-if="submitMessage" :class="submitStatus === 'success' ? 'text-emerald-400' : 'text-red-400'" class="text-sm text-center">
              {{ submitMessage }}
            </p>
          </form>
        </div>
      </div>
    </main>

    <LandingPageFooter />
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';
import LandingPageHeader from '../components/layout/LandingPageHeader.vue';
import LandingPageFooter from '../components/layout/LandingPageFooter.vue';

const authStore = useAuthStore();
const contactForm = ref({ /* ... */ });
const isSubmitting = ref(false);
const submitMessage = ref('');
const submitStatus = ref('');

const handleSubmitContactForm = async () => { /* ... */ };
if (authStore.isAuthenticated && authStore.user) {
  contactForm.value.email = authStore.user.email;
}
</script>