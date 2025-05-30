<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-900 text-slate-200 overflow-x-hidden">
    <header class="sticky top-0 z-30 w-full py-4 bg-slate-900/70 backdrop-blur-lg shadow-md">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
        <router-link to="/" class="flex items-center space-x-3 group">
          <img class="h-9 w-auto group-hover:opacity-80 transition-opacity" :src="logoUrl" alt="IntelliPath Logo" />
          <span class="text-2xl font-bold text-sky-400 group-hover:text-sky-300 transition-colors">IntelliPath</span>
        </router-link>
        <nav class="hidden md:flex items-center space-x-3 lg:space-x-5">
          <a href="#features" v-smooth-scroll class="landing-nav-link">Features</a>
          <a href="#how-it-works" v-smooth-scroll class="landing-nav-link">How It Works</a>
          <a href="#pricing" v-smooth-scroll class="landing-nav-link">Pricing</a>
          <router-link to="/getting-started" class="nav-link" title="How to Use IntelliPath">How to Use IntelliPath</router-link>
          <router-link to="/contact" class="landing-nav-link">Contact</router-link>
        </nav>
        <div class="flex items-center space-x-3">
          <template v-if="authStore.isAuthenticated">
            <span class="text-sm text-slate-400 hidden lg:block truncate max-w-[150px]" :title="authStore.user?.email">
              {{ authStore.user?.email }}
            </span>
            <router-link v-if="authStore.hasActiveSubscription" to="/dashboard" class="btn-intellipath-secondary !px-4 !py-1.5 text-xs sm:text-sm">
              Dashboard
            </router-link>
            <router-link v-else to="/subscription" class="btn-intellipath-primary !px-4 !py-1.5 text-xs sm:text-sm">
              Activate Plan
            </router-link>
            <button @click="handleLogout" title="Logout" class="p-2 text-slate-400 hover:text-sky-400 transition-colors">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            </button>
          </template>
          <template v-else>
            <router-link to="/login" class="text-slate-300 hover:text-sky-400 transition-colors px-3 py-2 text-xs sm:text-sm">Login</router-link>
            <router-link to="/signup" class="btn-intellipath-primary !px-4 !py-1.5 text-xs sm:text-sm">
              Sign Up Free
            </router-link>
          </template>
          <div class="flex md:hidden">
            <button @click="mobileMenuOpen = !mobileMenuOpen" class="p-2 rounded-md text-slate-300 hover:text-sky-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-sky-500" aria-controls="mobile-menu" :aria-expanded="mobileMenuOpen.toString()">
              <span class="sr-only">Open main menu</span>
              <svg v-if="!mobileMenuOpen" class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
              <svg v-else class="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>
      </div>
      <Transition enter-active-class="transition ease-out duration-200" enter-from-class="opacity-0 -translate-y-1" enter-to-class="opacity-100 translate-y-0" leave-active-class="transition ease-in duration-150" leave-from-class="opacity-100 translate-y-0" leave-to-class="opacity-0 -translate-y-1">
        <div v-if="mobileMenuOpen" class="md:hidden bg-slate-800/90 backdrop-blur-sm rounded-b-lg shadow-xl">
          <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <a @click="closeMobileMenuAndScroll('#features')" href="#features" class="landing-nav-link-mobile">Features</a>
            <a @click="closeMobileMenuAndScroll('#how-it-works')" href="#how-it-works" class="landing-nav-link-mobile">How It Works</a>
            <a @click="closeMobileMenuAndScroll('#pricing')" href="#pricing" class="landing-nav-link-mobile">Pricing</a>
            <router-link @click="mobileMenuOpen = false" to="/contact" class="landing-nav-link-mobile">Contact</router-link>
          </div>
        </div>
      </Transition>
    </header>

    <section class="relative pt-20 pb-24 md:pt-32 md:pb-40 text-center overflow-hidden">
      <div class="absolute inset-0 z-0 opacity-10">
        <div class="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 bg-gradient-radial from-sky-800 via-transparent to-transparent rounded-full animate-pulse-very-slow filter blur-3xl"></div>
        <div class="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 bg-gradient-radial from-purple-800 via-transparent to-transparent rounded-full animate-pulse-even-slower filter blur-3xl delay-3000"></div>
      </div>
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h1 class="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
          <span class="block text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">Unlock Personalized Learning Paths</span>
          <span class="block text-slate-100 mt-2 sm:mt-3">Powered by IntelliPath AI</span>
        </h1>
        <p class="mt-6 max-w-xl lg:max-w-3xl mx-auto text-lg sm:text-xl text-slate-300/90 leading-relaxed">
          IntelliPath transforms corporate L&D from a one-size-fits-all model to a dynamic, individualized experience. Our AI analyzes skill gaps, career aspirations, and learning preferences to curate unique educational journeys that boost engagement, knowledge retention, and deliver measurable ROI.
        </p>
        <div class="mt-10 flex flex-col sm:flex-row justify-center items-center gap-4">
          <router-link v-if="authStore.isAuthenticated && authStore.hasActiveSubscription" to="/dashboard" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
            Go to Your Dashboard
          </router-link>
          <router-link v-else-if="authStore.isAuthenticated && !authStore.hasActiveSubscription" to="/subscription" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
            Activate Your Plan
          </router-link>
          <router-link v-else to="/signup" class="btn-intellipath-primary !px-8 !py-3 text-lg w-full sm:w-auto">
            Start Your Free Trial
          </router-link>
          <a href="#features" v-smooth-scroll class="btn-intellipath-secondary !px-8 !py-3 text-lg w-full sm:w-auto">
            Discover Features
          </a>
        </div>
      </div>
    </section>

    <section id="how-it-works" class="py-16 md:py-24 bg-slate-900/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12 md:mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-sky-400">How IntelliPath Works</h2>
                <p class="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
                    A seamless journey from skill assessment to mastery, guided by AI.
                </p>
            </div>
            <div class="grid md:grid-cols-3 gap-8 text-center">
                <div class="card-intellipath p-6 md:p-8">
                    <div class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-sky-500 to-cyan-400 mb-3">1</div>
                    <h3 class="text-xl font-semibold text-slate-100 mb-2">Assess & Analyze</h3>
                    <p class="text-slate-400 text-sm">Integrates with HRIS, performance reviews, or uses built-in tools to understand current skills and desired career trajectories.</p>
                </div>
                <div class="card-intellipath p-6 md:p-8">
                    <div class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-cyan-500 to-teal-400 mb-3">2</div>
                    <h3 class="text-xl font-semibold text-slate-100 mb-2">AI Path Generation</h3>
                    <p class="text-slate-400 text-sm">Our intelligent engine crafts a unique learning path, curating content from internal libraries, licensed providers, and open web resources.</p>
                </div>
                <div class="card-intellipath p-6 md:p-8">
                     <div class="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-teal-500 to-emerald-400 mb-3">3</div>
                    <h3 class="text-xl font-semibold text-slate-100 mb-2">Learn & Adapt</h3>
                    <p class="text-slate-400 text-sm">Employees engage with interactive content. The path adapts in real-time based on progress, feedback, and evolving business needs.</p>
                </div>
            </div>
        </div>
    </section>

    <section id="features" class="py-16 md:py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12 md:mb-16">
          <h2 class="text-3xl md:text-4xl font-bold text-sky-400">Key Features of IntelliPath</h2>
          <p class="mt-4 text-lg text-slate-400 max-w-2xl mx-auto">
            Everything your L&D department needs for impactful, personalized training.
          </p>
        </div>
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m0-8a4 4 0 00-4 4h8a4 4 0 00-4-4z"></path></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">True Personalization</h3>
            <p class="mt-2 text-slate-400 text-sm">AI understands individual skill gaps, learning styles, and career goals to create truly unique pathways.</p>
          </div>
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10m16-5H4m16 0l-3.172-3.172a4 4 0 00-5.656 0L8 10m0 0l-3.172 3.172a4 4 0 005.656 0L12 10z" /></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">Smart Content Aggregation</h3>
            <p class="mt-2 text-slate-400 text-sm">Pulls the best content from internal repositories, top learning platforms (Coursera, LinkedIn Learning), and the open web.</p>
          </div>
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">Adaptive Curriculum</h3>
            <p class="mt-2 text-slate-400 text-sm">Learning paths adjust based on learner progress, feedback, and shifting business priorities, ensuring relevance.</p>
          </div>
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">Interactive & Engaging</h3>
            <p class="mt-2 text-slate-400 text-sm">Includes interactive elements, simulations, and opportunities for mentor matching to boost engagement.</p>
          </div>
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">Seamless Integrations</h3>
            <p class="mt-2 text-slate-400 text-sm">Connects with your existing HRIS, performance review tools, and skills assessment platforms.</p>
          </div>
          <div class="card-intellipath p-6">
            <div class="feature-icon-bg"><svg class="h-6 w-6 text-lime-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg></div>
            <h3 class="text-xl font-semibold text-slate-100 mt-4">Measurable ROI</h3>
            <p class="mt-2 text-slate-400 text-sm">Track skill development, engagement metrics, and training effectiveness to demonstrate clear ROI.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="pricing" class="py-16 md:py-24 bg-slate-900/50">
        <div class="container mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center mb-12 md:mb-16">
                <h2 class="text-3xl md:text-4xl font-bold text-sky-400">Simple, Transparent Pricing</h2>
                <p class="mt-4 text-lg text-slate-400 max-w-xl mx-auto">Choose the plan that's right for your organization.</p>
            </div>
            <div class="flex justify-center">
                <div class="card-intellipath p-8 max-w-sm w-full transform hover:scale-105 transition-transform duration-300">
                    <div class="text-center">
                        <h3 class="text-2xl font-semibold text-teal-400">Basic Plan</h3>
                        <p class="mt-4 text-5xl font-extrabold text-slate-100">$29</p>
                        <p class="mt-1 text-base text-slate-400">per employee / month</p>
                        <router-link to="/signup" class="btn-intellipath-primary w-full mt-8 !py-3">Get Started with Basic</router-link>
                    </div>
                    <ul class="mt-8 space-y-3 text-sm text-slate-300">
                        <li class="flex items-center"><svg class="w-5 h-5 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Up to 10 Active Employees</li>
                        <li class="flex items-center"><svg class="w-5 h-5 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>AI Path Generation & Curation</li>
                        <li class="flex items-center"><svg class="w-5 h-5 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Basic Analytics</li>
                        <li class="flex items-center"><svg class="w-5 h-5 text-emerald-500 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path></svg>Email Support</li>
                    </ul>
                    <p class="mt-6 text-xs text-slate-500 text-center">More plans for larger teams and advanced features coming soon!</p>
                </div>
            </div>
        </div>
    </section>

    <section class="py-16 md:py-24">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 class="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
          Ready to Build a Smarter Workforce?
        </h2>
        <p class="mt-4 max-w-xl mx-auto text-lg text-slate-300/90">
          See how IntelliPath can elevate your corporate training.
        </p>
        <div class="mt-8">
          <router-link v-if="!authStore.isAuthenticated" to="/signup" class="btn-intellipath-primary !px-10 !py-4 text-xl">
            Start Free Trial Now
          </router-link>
           <router-link v-else-if="authStore.isAuthenticated && !authStore.hasActiveSubscription" to="/subscription" class="btn-intellipath-primary !px-10 !py-4 text-xl">
            Activate Your Plan
          </router-link>
          <router-link v-else to="/dashboard" class="btn-intellipath-primary !px-10 !py-4 text-xl">
            Go To Dashboard
          </router-link>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="py-8 bg-slate-900/70 border-t border-slate-700/50">
      <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
        <div class="mb-2">
            <router-link to="/" class="hover:text-sky-400 px-2">Home</router-link> |
            <router-link to="/contact" class="hover:text-sky-400 px-2">Contact</router-link> |
            <router-link to="/terms-of-service" class="hover:text-sky-400 px-2">Terms</router-link> |
            <router-link to="/privacy-policy" class="hover:text-sky-400 px-2">Privacy</router-link>
        </div>
        <p>© {{ new Date().getFullYear() }} IntelliPath. Elevating Learning with Intelligence.</p>
      </div>
    </footer>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; 
import { useAuthStore } from '../stores/authStore';
import logoUrl from '../assets/intellipath-logo.png'; 

const authStore = useAuthStore();
const mobileMenuOpen = ref(false);

onMounted(() => {
  if (!authStore.user && localStorage.getItem('token')) {
    authStore.checkAuthStatus();
  }
});

const handleLogout = () => {
  mobileMenuOpen.value = false;
  authStore.logout();
};

const closeMobileMenuAndScroll = (hash) => {
  mobileMenuOpen.value = false;
  setTimeout(() => {
    const targetElement = document.querySelector(hash);
    if (targetElement) {
      const headerOffset = 70;
      const elementPosition = targetElement.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
    }
  }, 150);
};

const vSmoothScroll = {
  mounted: (el) => {
    el.addEventListener('click', (event) => {
      const href = el.getAttribute('href');
      if (href && href.startsWith('#')) {
        event.preventDefault();
        const targetElement = document.querySelector(href);
        if (targetElement) {
          const headerOffset = 70;
          const elementPosition = targetElement.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
          window.scrollTo({ top: offsetPosition, behavior: "smooth" });
        }
      }
    });
  }
};
</script>

<style scoped>
.landing-nav-link {
  @apply text-slate-300 hover:text-sky-400 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150;
}
.landing-nav-link-mobile {
  @apply block text-slate-200 hover:bg-slate-700 hover:text-sky-300 px-3 py-2 rounded-md text-base font-medium transition-colors duration-150;
}
.feature-icon-bg {
  @apply inline-flex items-center justify-center h-12 w-12 rounded-lg bg-slate-700/50; /* Subtle background for icons */
}
.delay-1000 { animation-delay: 1s; }
.delay-2000 { animation-delay: 2s; }
.delay-3000 { animation-delay: 3s; }

@keyframes pulse-very-slow { /* Slower and more subtle */
  0%, 100% { transform: scale(1); opacity: 0.1; }
  50% { transform: scale(1.03); opacity: 0.15; }
}
@keyframes pulse-even-slower {
  0%, 100% { transform: scale(1); opacity: 0.08; }
  50% { transform: scale(1.02); opacity: 0.12; }
}
.animate-pulse-very-slow {
  animation: pulse-very-slow 20s infinite ease-in-out;
}
.animate-pulse-even-slower {
  animation: pulse-even-slower 25s infinite ease-in-out;
}
.bg-gradient-radial {
  background-image: radial-gradient(ellipse at center, var(--tw-gradient-stops));
}
</style>