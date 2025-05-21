<template>
  <div class="min-h-screen bg-slate-900 text-slate-300">
    <LandingHeader /> <!-- Assuming you extract landing header to a component -->
    
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="card-intellipath p-6 md:p-10 max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-sky-400 mb-6 border-b border-slate-700 pb-3">Terms of Service</h1>
        <div class="prose prose-invert prose-sm sm:prose-base max-w-none space-y-4">
          <p><strong>Effective Date: {{ new Date().toLocaleDateString() }}</strong></p>
          
          <p>Welcome to IntelliPath! These Terms of Service ("Terms") govern your access to and use of the IntelliPath website, applications, and services (collectively, the "Service") provided by IntelliPath Inc. ("IntelliPath", "we", "us", or "our"). Please read these Terms carefully before using the Service.</p>

          <h2 class="text-xl text-sky-500">1. Acceptance of Terms</h2>
          <p>By accessing or using our Service, you agree to be bound by these Terms and our Privacy Policy. If you do not agree to these Terms, do not use the Service.</p>

          <!-- Add many more sections: Your Account, Use of Service, Subscriptions, Content, Intellectual Property, Termination, Disclaimers, Limitation of Liability, Governing Law, Changes to Terms, Contact Us etc. -->
          <p class="mt-8"><em>[Placeholder: This is a very basic template. A full Terms of Service is a comprehensive legal document. You should consult with a legal professional to draft terms appropriate for your SaaS product.]</em></p>
        </div>
      </div>
    </main>

    <LandingFooter /> <!-- Assuming you extract landing footer to a component -->
  </div>
</template>

<script setup>
// import LandingHeader from '../components/layout/LandingHeader.vue';
// import LandingFooter from '../components/layout/LandingFooter.vue';
</script>

<style> 
/* Re-use prose styles from PrivacyPolicyView or global styles */
.prose-invert h2 { @apply text-sky-400; }
.prose-invert h3 { @apply text-slate-100; }
.prose-invert p, .prose-invert li { @apply text-slate-300; }
.prose-invert strong { @apply text-slate-100; }
.prose-invert a { @apply text-cyan-400 hover:text-cyan-300; }
</style>