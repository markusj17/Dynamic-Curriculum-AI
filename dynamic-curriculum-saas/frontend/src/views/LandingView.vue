<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 overflow-x-hidden">
    <header class="sticky top-0 z-30 w-full py-4 bg-slate-900/80 backdrop-blur-md">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <router-link to="/" class="flex items-center space-x-2">
          <img :src="logoUrl" alt="IntelliPath Logo" class="h-8 w-auto" />
          <span class="text-2xl font-bold text-sky-400">IntelliPath</span>
        </router-link>
        <nav class="space-x-4">
          <router-link to="/login" class="text-slate-300 hover:text-sky-400 transition-colors">Login</router-link>
          <router-link to="/signup" class="btn-intellipath-primary !px-5 !py-2 text-sm">
            Get Started
          </router-link>
        </nav>
      </div>
    </header>

    <section class="relative py-20 md:py-32 lg:py-40 text-center overflow-hidden">
      <div class="absolute inset-0 z-0 opacity-20">
        <div class="absolute top-[-30%] left-[-30%] w-[80vw] h-[80vw] bg-gradient-radial from-sky-700/50 via-transparent to-transparent rounded-full animate-pulse-slow"></div>
        <div class="absolute bottom-[-40%] right-[-25%] w-[90vw] h-[90vw] bg-gradient-radial from-purple-700/40 via-transparent to-transparent rounded-full animate-pulse-slower delay-2000"></div>
      </div>

      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 class="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight">
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">Revolutionize Corporate Learning</span>
          <span class="block text-slate-300 mt-2 sm:mt-4">with AI-Powered Dynamic Curriculums.</span>
        </h1>
        <p class="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-slate-400">
          Stop one-size-fits-all training. IntelliPath personalizes learning pathways to boost engagement, retention, and ROI for your L&D programs.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <router-link to="/signup" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
            Get Started
          </router-link>
          <a href="#features" v-smooth-scroll class="btn-intellipath-secondary !px-8 !py-3 text-lg w-full sm:w-auto">
            Learn More
          </a>
        </div>
      </div>
    </section>

    <section id="features" class="py-16 md:py-24 bg-slate-800/30">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-sky-400">Why IntelliPath?</h2>
          <p class="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Empower your workforce with training that adapts to individual needs and drives real results.
          </p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-sky-500 to-cyan-600 text-white mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m0-8a4 4 0 00-4 4h8a4 4 0 00-4-4z"></path></svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-100">AI-Personalized Paths</h3>
            <p class="mt-2 text-slate-400">Dynamically generated curriculums tailored to skill gaps, career goals, and learning styles.</p>
          </div>
          <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
            <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-100">Adaptive Learning</h3>
            <p class="mt-2 text-slate-400">Curriculum evolves in real-time based on learner progress and changing business needs.</p>
          </div>
          <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
             <div class="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 text-white mb-4">
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
            </div>
            <h3 class="text-xl font-semibold text-slate-100">Diverse Content Curation</h3>
            <p class="mt-2 text-slate-400">Pulls from internal, licensed, and open web resources for comprehensive learning.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="py-16 md:py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-slate-100">Ready to Transform Your L&D?</h2>
        <p class="mt-4 max-w-xl mx-auto text-lg text-slate-400">
          Join leading companies in building a more skilled, engaged, and future-ready workforce with IntelliPath.
        </p>
        <div class="mt-8">
          <router-link to="/signup" class="btn-intellipath-primary !px-10 !py-4 text-xl">
            Sign Up & Start Personalizing
          </router-link>
        </div>
      </div>
    </section>

    <footer class="py-8 bg-slate-800/50 border-t border-slate-700/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
        <p>© {{ new Date().getFullYear() }} IntelliPath. All rights reserved.</p>
        <p class="mt-1">
          <router-link to="/privacy" class="hover:text-sky-400 transition-colors">Privacy Policy</router-link> | 
          <router-link to="/terms" class="hover:text-sky-400 transition-colors">Terms of Service</router-link>
        </p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import logoUrl from '../assets/intellipath-logo.png'; 


const vSmoothScroll = {
  mounted: (el) => {
    el.addEventListener('click', (event) => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth' });
        }
      }
    });
  }
};

</script>

<style scoped>
.delay-2000 { 
  animation-delay: 2s;
}
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