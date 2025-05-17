import { defineStore } from 'pinia';
import authService from '../services/authService';
import stripeService from '../services/stripeService';
import router from '../router'; 

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    subscriptionStatus: localStorage.getItem('subscriptionStatus') || 'inactive',
    isLoading: false,
    error: null,
    isFetchingCurrentUser: false,
  }),
  getters: {
    isAuthenticated: (state) => !!state.token && !!state.user,
    isLdManager: (state) => state.user && state.user.role === 'ld_manager',
    hasActiveSubscription: (state) => state.subscriptionStatus === 'active' || state.subscriptionStatus === 'trialing',
    currentUser: (state) => state.user,
  },
  actions: {
    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        const { token, ...userData } = response.data;
        this.token = token;
        this.user = userData;
        this.subscriptionStatus = userData.subscription_status || 'inactive';
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Login failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    async register(userData) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await authService.register(userData);
        const { token, ...newUserData } = response.data;
        this.token = token;
        this.user = newUserData;
        this.subscriptionStatus = newUserData.subscription_status || 'inactive';
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(newUserData));
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed';
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    logout() {
      console.log("AuthStore: Logging out user.");
      this.user = null;
      this.token = null;
      this.subscriptionStatus = 'inactive';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('subscriptionStatus');
      if (router.currentRoute.value.meta.requiresAuth) {
         router.push({ name: 'Login' });
      }
    },
    async fetchCurrentUser() {
      if (!this.token || this.isFetchingCurrentUser) {
        if (!this.token && this.user) this.logout(); 
        return;
      }
      
      this.isFetchingCurrentUser = true;
      this.isLoading = true; 
      try {
        console.log("AuthStore: Fetching current user...");
        const response = await authService.getMe();
        this.user = response.data;
        this.subscriptionStatus = this.user.subscription_status || 'inactive';
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
        console.log("AuthStore: Current user fetched and updated.", this.user);
      } catch (err) {
        console.error("AuthStore: Error fetching current user:", err.response?.data?.message || err.message);
        if (err.response?.status === 401) {
          this.logout();
        }
      } finally {
        this.isLoading = false;
        this.isFetchingCurrentUser = false;
      }
    },
    async checkAuthStatus() {
      console.log("AuthStore: Checking auth status...");
      if (this.token && !this.user) {
        console.log("AuthStore: Token found, user object missing. Fetching current user.");
        await this.fetchCurrentUser();
      } else if (!this.token) {
        console.log("AuthStore: No token found. Ensuring user is logged out.");

        if (this.user) { 
            this.logout();
        }
      } else {
        console.log("AuthStore: Token and user object already in store. Status assumed current for now.");

      }
    },
    async updateSubscriptionStatus() {
       if (!this.isAuthenticated) return;
        this.isLoading = true;
        try {
            const response = await stripeService.getSubscriptionStatus();
            this.subscriptionStatus = response.data.status;
            localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
            if (this.user) {
                this.user.subscription_status = this.subscriptionStatus;
                localStorage.setItem('user', JSON.stringify(this.user));
            }
        } catch (error) {
            console.error("AuthStore: Failed to update subscription status:", error.response?.data?.message || error.message);
        } finally {
            this.isLoading = false;
        }
    },
    setSubscriptionSuccess() {
        this.subscriptionStatus = 'active';
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
        if (this.user) {
            this.user.subscription_status = this.subscriptionStatus;
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    }
  },
});