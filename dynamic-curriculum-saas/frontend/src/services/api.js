import axios from 'axios';
import { useAuthStore } from '../stores/authStore'; // Import Pinia store

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore(); // Get store instance inside interceptor
    const token = authStore.token;
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors (e.g., 401 for logout)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const authStore = useAuthStore();
    if (error.response && error.response.status === 401) {
      // Unauthorized, token might be expired or invalid
      authStore.logout(); // Call logout action from your auth store
      // Optionally redirect to login page
      // router.push('/login'); // Make sure to import router if used here
    }
    return Promise.reject(error);
  }
);

export default apiClient;