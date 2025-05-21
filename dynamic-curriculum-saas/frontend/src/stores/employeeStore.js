import { defineStore } from 'pinia';
import employeeService from '../services/employeeService';
import learningPathService from '../services/learningPathService';

export const useEmployeeStore = defineStore('employee', {
  state: () => ({
    employees: [],
    currentEmployee: null,
    isLoading: false,
    error: null,
    newlyCreatedEmployeeCredentials: null,
  }),
  actions: {
    async fetchEmployees() {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await employeeService.getEmployees();
            this.employees = response.data;
        } catch (err) {
            this.error = err.response?.data?.message || 'Failed to fetch employees';
            console.error("EmployeeStore fetchEmployees error:", err);
        } finally {
            this.isLoading = false;
        }
    },
    async fetchEmployeeById(id) {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await employeeService.getEmployeeById(id);
            this.currentEmployee = response.data;
            return this.currentEmployee;
        } catch (err) {
            this.error = err.response?.data?.message || `Failed to fetch employee with ID ${id}`;
            console.error("EmployeeStore fetchEmployeeById error:", err);
            this.currentEmployee = null;
            throw err;
        } finally {
            this.isLoading = false;
        }
    },
    async addEmployee(employeeData) {
      this.isLoading = true;
      this.error = null;
      this.newlyCreatedEmployeeCredentials = null;
      try {
        const response = await employeeService.createEmployee(employeeData);
        this.employees.push(response.data.employee);
        this.newlyCreatedEmployeeCredentials = {
            username: response.data.username,
            password: response.data.temporaryPassword,
            employeeName: response.data.employee.name
        };
        return response.data.employee;
      } catch (err) {
        this.error = err.response?.data?.message || 'Failed to add employee';
        console.error("EmployeeStore addEmployee error:", err);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    clearNewCredentials() {
        this.newlyCreatedEmployeeCredentials = null;
    },
    async updateEmployee(id, employeeData) {
        this.isLoading = true;
        this.error = null;
        try {
            const response = await employeeService.updateEmployee(id, employeeData);
            const updatedEmployee = response.data;
            const index = this.employees.findIndex(e => e.id === id);
            if (index !== -1) {
              this.employees.splice(index, 1, updatedEmployee);
            }
            if (this.currentEmployee && this.currentEmployee.id === id) {
              this.currentEmployee = updatedEmployee;
            }
            return updatedEmployee;
        } catch (err) {
            this.error = err.response?.data?.message || 'Failed to update employee';
            console.error("EmployeeStore updateEmployee error:", err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },
    async deleteEmployee(id) {
        this.isLoading = true;
        this.error = null;
        try {
            await employeeService.deleteEmployee(id);
            this.employees = this.employees.filter(e => e.id !== id);
            if (this.currentEmployee && this.currentEmployee.id === id) {
                this.currentEmployee = null;
            }
            return true;
        } catch (err) {
            this.error = err.response?.data?.message || 'Failed to delete employee';
            console.error("EmployeeStore deleteEmployee error:", err);
            return false;
        } finally {
            this.isLoading = false;
        }
    },
    async regenerateCredentials(employeeId) {
        this.isLoading = true;
        this.error = null;
        this.newlyCreatedEmployeeCredentials = null;
        try {
            const response = await employeeService.regenerateEmployeeCredentials(employeeId);
            this.newlyCreatedEmployeeCredentials = {
                username: response.data.username,
                password: response.data.newTemporaryPassword,
                employeeName: response.data.employeeName
            };
            return true; 
        } catch (err) {
            this.error = err.response?.data?.message || 'Failed to regenerate credentials.';
            console.error("EmployeeStore regenerateCredentials error:", err);
            throw err;
        } finally {
            this.isLoading = false;
        }
    },

    async generateLearningPathForEmployee(employeeId) {
        this.isLoading = true; 
        this.error = null;
        try {
            const response = await learningPathService.generateOrUpdatePath(employeeId);
            if (this.currentEmployee && this.currentEmployee.id == employeeId) {
                this.currentEmployee.learningPath = response.data;
            } else {
                const empIndex = this.employees.findIndex(e => e.id == employeeId);
                if (empIndex !== -1) {
                    this.employees[empIndex].learningPath = response.data;
                }
            }
            return response.data; 
        } catch (err) {
            const errorData = err.response?.data || { message: 'Failed to generate learning path' };
            this.error = errorData.message;
            console.error("EmployeeStore generateLearningPath error:", err);
            return { error: errorData.message, raw: errorData.aiRawResponse || errorData.originalErrorMessage || err.message };
        } finally {
            this.isLoading = false;
        }
    },
    async curatePath(pathId, pathUpdates) {
        this.isLoading = true; this.error = null;
        try {
            const response = await learningPathService.curateLearningPath(pathId, pathUpdates);
            if (this.currentEmployee?.learningPath?.id === pathId) this.currentEmployee.learningPath = response.data;
            const empIndex = this.employees.findIndex(e => e.learningPath?.id === pathId);
            if (empIndex !== -1) this.employees[empIndex].learningPath = response.data;
            return response.data;
        } catch (err) { this.error = err.response?.data?.message || 'Failed to curate path'; throw err; }
        finally { this.isLoading = false; }
    },
    async updatePathStepStatus(pathId, stepIndex, completed) {
        this.isLoading = true; this.error = null;
        try {
            const response = await learningPathService.updateStepStatus(pathId, stepIndex, completed);
            if (this.currentEmployee?.learningPath?.id === pathId) this.currentEmployee.learningPath = response.data;
            return response.data;
        } catch (err) { this.error = err.response?.data?.message || 'Failed to update step'; throw err; }
        finally { this.isLoading = false; }
    }
  },
});