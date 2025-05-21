<template>
  <div class="min-h-screen bg-slate-900 text-slate-300">
    <!-- Use Landing Page Header or a simplified one -->
    <LandingHeader /> <!-- Assuming you extract landing header to a component -->
    
    <main class="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      <div class="card-intellipath p-6 md:p-10 max-w-3xl mx-auto">
        <h1 class="text-3xl font-bold text-sky-400 mb-6 border-b border-slate-700 pb-3">Privacy Policy</h1>
        <div class="prose prose-invert prose-sm sm:prose-base max-w-none space-y-4">
          <p><strong>Last Updated: {{ new Date().toLocaleDateString() }}</strong></p>
          
          <p>IntelliPath ("us", "we", or "our") operates the IntelliPath website and SaaS platform (the "Service"). This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.</p>

          <h2 class="text-xl text-sky-500">Information Collection and Use</h2>
          <p>We collect several different types of information for various purposes to provide and improve our Service to you.</p>
          
          <h3 class="text-lg text-slate-200">Types of Data Collected</h3>
          <h4>Personal Data</h4>
          <p>While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:</p>
          <ul>
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Company name</li>
            <li>Usage Data</li>
            <!-- Add more as per your actual data collection -->
          </ul>

          <!-- Add many more sections: Usage Data, Cookies, Use of Data, Transfer, Disclosure, Security, Your Rights, etc. -->
          <p class="mt-8"><em>[Placeholder: This is a very basic template. A full privacy policy is a comprehensive legal document. You should consult with a legal professional to draft a policy that meets all legal requirements for your specific service and data handling practices.]</em></p>
        </div>
      </div>
    </main>

    <!-- Use Landing Page Footer or a simplified one -->
    <LandingFooter /> <!-- Assuming you extract landing footer to a component -->
  </div>
</template>

<script setup>

</script>

<style>
/* Tailwind Prose plugin styles for markdown-like content if you install it */
/* Or style h2, h3, p, ul, li manually for readability */
.prose-invert h2 { @apply text-sky-400; }
.prose-invert h3 { @apply text-slate-100; }
.prose-invert p, .prose-invert li { @apply text-slate-300; }
.prose-invert strong { @apply text-slate-100; }
.prose-invert a { @apply text-cyan-400 hover:text-cyan-300; }
</style>