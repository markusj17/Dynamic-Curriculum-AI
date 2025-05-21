<template>
  <div class="p-4 md:p-8 space-y-8">
    <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        L&D Dashboard
      </h1>
      <button @click="openAddEmployeeModal" class="btn-intellipath-primary flex items-center">
        <svg class="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
        Add Employee
      </button>
    </header>

    <!-- Stats Cards -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
        <div class="flex items-center text-slate-400 mb-2">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.653-.084-1.28-.247-1.879M12 12<a>4 4 0 11-8 0 4 4 0 018 0zm0 0c1.293 0 2.523.419 3.478 1.175M12 12c-.397 0-.781.044-1.152.122M12 12c-2.209 0-4-1.791-4-4s1.791-4 4-4 4 1.791 4 4-1.791 4-4 4zM3 21h18M3 7h18"></path></svg>
          <h3 class="text-lg font-medium">Total Employees</h3>
        </div>
        <p class="mt-1 text-4xl font-semibold text-sky-400">{{ employeeStore.employees.length }}</p>
        <p class="text-sm text-slate-500 mt-1">Managed within IntelliPath</p>
      </div>
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
         <div class="flex items-center text-slate-400 mb-2">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path></svg>
          <h3 class="text-lg font-medium">Paths In Progress</h3>
        </div>
        <p class="mt-1 text-4xl font-semibold text-teal-400">{{ pathsInProgress }}</p>
         <p class="text-sm text-slate-500 mt-1">Active learning journeys</p>
      </div>
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
         <div class="flex items-center text-slate-400 mb-2">
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h3 class="text-lg font-medium">Completed Paths</h3>
        </div>
        <p class="mt-1 text-4xl font-semibold text-emerald-400">{{ pathsCompleted }}</p>
        <p class="text-sm text-slate-500 mt-1">Successfully finished</p>
      </div>
    </div>

    <!-- Employee List Section -->
    <div>
      <h2 class="text-2xl font-semibold text-slate-200 mb-4 mt-8">Employee Overview</h2>
      <div v-if="employeeStore.isLoading && !initialLoadComplete" class="card-intellipath p-10 text-center">
        <p class="text-slate-400 animate-pulse">Loading employees...</p>
      </div>
      <div v-else-if="employeeStore.error && employeeStore.employees.length === 0" class="card-intellipath p-6 text-red-400 bg-red-900/30">
        Error loading employees: {{ employeeStore.error }}
      </div>
      <div v-else-if="employeeStore.employees.length === 0" class="card-intellipath p-10 text-center">
        <p class="text-slate-300 text-lg">No employees added yet.</p>
        <p class="text-sm text-slate-500">Click "Add Employee" to get started.</p>
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <!-- EmployeeListItem will now show the share button -->
        <EmployeeListItem
          v-for="employee in employeeStore.employees"
          :key="employee.id"
          :employee="employee"
          class="transform hover:-translate-y-1 transition-transform duration-300 ease-out"
        />
      </div>
    </div>

    <!-- Add Employee Modal -->
    <Transition name="modal-fade">
      <div v-if="showAddEmployeeModal" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
           @click.self="closeModal">
        <div class="card-intellipath w-full max-w-lg p-6 md:p-8" role="dialog" aria-modal="true">
          <EmployeeForm @success="handleEmployeeAdded" @cancel="closeModal"/>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
// Script section is the same as the last fully provided LDDashboardView.vue
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '../stores/employeeStore';
import EmployeeListItem from '../components/employees/EmployeeListItem.vue'; // Path to your component
import EmployeeForm from '../components/employees/EmployeeForm.vue';     // Path to your component

const employeeStore = useEmployeeStore();
const showAddEmployeeModal = ref(false);
const initialLoadComplete = ref(false);

onMounted(async () => {
  await employeeStore.fetchEmployees();
  initialLoadComplete.value = true;
});

const pathsInProgress = computed(() => {
  if (!employeeStore.employees) return 0;
  return employeeStore.employees.filter(e => e.learningPath && (e.learningPath.status === 'assigned' || e.learningPath.status === 'in_progress')).length;
});
const pathsCompleted = computed(() => {
  if (!employeeStore.employees) return 0;
  return employeeStore.employees.filter(e => e.learningPath && e.learningPath.status === 'completed').length;
});

const openAddEmployeeModal = () => { showAddEmployeeModal.value = true; };
const handleEmployeeAdded = async () => {
  showAddEmployeeModal.value = false;
  await employeeStore.fetchEmployees(); 
};
const closeModal = () => {
  showAddEmployeeModal.value = false;
  if (employeeStore.error) employeeStore.error = null;
};
</script>

<style scoped>
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-fade-enter-active .card-intellipath,
.modal-fade-leave-active .card-intellipath {
  transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02);
}
.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
}
.modal-fade-enter-from .card-intellipath,
.modal-fade-leave-to .card-intellipath {
  transform: scale(0.95) translateY(-20px);
  opacity: 0;
}
</style>