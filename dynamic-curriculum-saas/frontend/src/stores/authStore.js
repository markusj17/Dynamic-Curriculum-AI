import { defineStore } from 'pinia';
import authService from '../services/authService';
import stripeService from '../services/stripeService';
import router from '../router'; // Ensure router is imported

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
    isLdManager: (state) => state.user?.role === 'ld_manager',
    hasActiveSubscription: (state) =>
      state.subscriptionStatus === 'active' || state.subscriptionStatus === 'trialing',
    currentUser: (state) => state.user,
  },
  actions: {
    _setAuthData(token, userData) {
      this.token = token;
      this.user = userData;
      this.subscriptionStatus = userData.subscription_status || 'inactive';
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
    },
    _clearAuthData() {
      this.user = null;
      this.token = null;
      this.subscriptionStatus = 'inactive';
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('subscriptionStatus');
    },

    async login(credentials) {
      this.isLoading = true;
      this.error = null;
      try {
        const response = await authService.login(credentials);
        const { token, ...userData } = response.data;
        this._setAuthData(token, userData);
        
        const redirectPath = router.currentRoute.value.query.redirect || { name: 'LDDashboard' };
        router.push(redirectPath);
        return true;
      } catch (err) {
        this._clearAuthData();
        this.error = err.response?.data?.message || 'Login failed. Please check your credentials.';
        console.error("AuthStore: Login error", err.response || err);
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
        this._setAuthData(token, newUserData);

        console.log("AuthStore: Registration successful, user set:", this.user);
        
        // *** CHANGE THIS LINE ***
        // Redirect to the dashboard after successful registration.
        // The dashboard's route guard will then check for subscription status.
        router.push({ name: 'LDDashboard' }); 

        return true;
      } catch (err) {
        this.error = err.response?.data?.message || 'Registration failed. Please try again.';
        console.error("AuthStore: Registration error", err.response || err);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      console.log("AuthStore: Logging out user.");
      this._clearAuthData();
      if (router.currentRoute.value.name !== 'Login' && router.currentRoute.value.name !== 'Landing') {
         router.push({ name: 'Login' });
      }
    },

    async fetchCurrentUser() {
      // ... (fetchCurrentUser logic remains the same from previous full script)
      if (!this.token || this.isFetchingCurrentUser) {
        if (!this.token && this.user) {
            this._clearAuthData();
        }
        return;
      }
      this.isFetchingCurrentUser = true;
      try {
        const response = await authService.getMe();
        this.user = response.data; 
        this.subscriptionStatus = this.user.subscription_status || 'inactive';
        localStorage.setItem('user', JSON.stringify(this.user));
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
      } catch (err) {
        if (err.response?.status === 401) this.logout();
      } finally {
        this.isFetchingCurrentUser = false;
      }
    },

    async checkAuthStatus() {
      // ... (checkAuthStatus logic remains the same from previous full script)
      if (this.token && !this.user) { 
        await this.fetchCurrentUser();
      } else if (!this.token && this.user) {
        this.logout();
      }
    },

    async updateSubscriptionStatus() {
      // ... (updateSubscriptionStatus logic remains the same from previous full script)
       if (!this.isAuthenticated) return;
        try {
            const response = await stripeService.getSubscriptionStatus();
            this.subscriptionStatus = response.data.status;
            localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
            if (this.user) {
                this.user.subscription_status = this.subscriptionStatus;
                localStorage.setItem('user', JSON.stringify(this.user));
            }
        } catch (error) {
            console.error("AuthStore: Failed to update subscription status from backend:", error.response?.data?.message || error.message);
        }
    },

    setSubscriptionSuccess() {
      // ... (setSubscriptionSuccess logic remains the same from previous full script)
        this.subscriptionStatus = 'active'; 
        localStorage.setItem('subscriptionStatus', this.subscriptionStatus);
        if (this.user) {
            this.user.subscription_status = this.subscriptionStatus;
            localStorage.setItem('user', JSON.stringify(this.user));
        }
    }
  },
});