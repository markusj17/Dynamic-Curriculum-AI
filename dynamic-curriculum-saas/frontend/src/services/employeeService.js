import apiClient from './api';

export default {
  createEmployee(employeeData) {
    return apiClient.post('/employees', employeeData);
  },
  getEmployees() {
    return apiClient.get('/employees');
  },
  getEmployeeById(id) {
    return apiClient.get(`/employees/${id}`);
  },
  updateEmployee(id, employeeData) {
    return apiClient.put(`/employees/${id}`, employeeData);
  },
  deleteEmployee(id) {
    return apiClient.delete(`/employees/${id}`);
  },
};