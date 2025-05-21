<template>
  <footer class="py-8 bg-slate-900/70 border-t border-slate-700/50 backdrop-blur-sm">
    <div class="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-slate-400">
      <div class="mb-2 flex flex-wrap justify-center gap-x-4 gap-y-2">
        <router-link to="/" class="hover:text-sky-400 transition-colors">Home</router-link>
        <a href="/#features" @click.prevent="smoothScrollToSection('/#features')" class="hover:text-sky-400 transition-colors">Features</a>
        <router-link to="/contact" class="hover:text-sky-400 transition-colors">Contact</router-link>
        <router-link to="/terms-of-service" class="hover:text-sky-400 transition-colors">Terms</router-link>
        <router-link to="/privacy-policy" class="hover:text-sky-400 transition-colors">Privacy</router-link>
      </div>
      <p>© {{ new Date().getFullYear() }} IntelliPath. Elevating Learning with Intelligence.</p>
    </div>
  </footer>
</template>

<script setup>
import { useRouter } from 'vue-router';
const router = useRouter();

// Helper for smooth scroll, ensure it works if navigating from another page to landing#hash
const smoothScrollToSection = (pathWithHash) => {
  const [path, hash] = pathWithHash.split('#');
  if (router.currentRoute.value.path !== path && path) {
    router.push(path).then(() => {
      if (hash) scrollToHash(hash);
    });
  } else if (hash) {
    scrollToHash(hash);
  }
};

const scrollToHash = (hash) => {
  const targetElement = document.querySelector(`#${hash}`);
  if (targetElement) {
    const headerOffset = 70; // Adjust to your sticky header's height
    const elementPosition = targetElement.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
    window.scrollTo({ top: offsetPosition, behavior: "smooth" });
  }
};
</script>