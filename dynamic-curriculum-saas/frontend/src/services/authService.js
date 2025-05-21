import apiClient from './api';

export default {
  register(userData) {
    return apiClient.post('/auth/register', userData);
  },
  login(credentials) {
    return apiClient.post('/auth/login', credentials);
  },
  loginEmployee(credentials) { 
    return apiClient.post('/auth/employee/login', credentials);
  },
  getMe() {
    return apiClient.get('/auth/me');
  },
  // updateProfile(profileData) {
  //   return apiClient.put('/users/profile', profileData);
  // }
};