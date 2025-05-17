import apiClient from './api';

export default {
  generateOrUpdatePath(employeeId) {
    return apiClient.post(`/learning-paths/employee/${employeeId}/generate`);
  },
  getLearningPathForEmployee(employeeId) {
    return apiClient.get(`/learning-paths/employee/${employeeId}`);
  },
  curateLearningPath(pathId, pathData) { // pathData could include { path_data: [...], status: 'assigned' }
    return apiClient.put(`/learning-paths/${pathId}`, pathData);
  },
  updateStepStatus(pathId, stepIndex, completed) {
    return apiClient.patch(`/learning-paths/${pathId}/step/${stepIndex}`, { completed });
  },
};