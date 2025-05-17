import { computed } from 'vue';
import { useAuthStore } from '../stores/authStore';

export function useAuth() {
  const store = useAuthStore();

  return {
    user: computed(() => store.user),
    isAuthenticated: computed(() => store.isAuthenticated),
    isLdManager: computed(() => store.isLdManager),
    logout: store.logout,
  };
}