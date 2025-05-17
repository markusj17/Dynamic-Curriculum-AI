<template>
  <div class="p-4 md:p-8 space-y-8">
    <header class="flex justify-between items-center">
      <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
        L&D Dashboard
      </h1>
      <button @click="openAddEmployeeModal" class="btn-intellipath-primary">
        <svg class="w-5 h-5 mr-2 -ml-1" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd"></path></svg>
        Add Employee
      </button>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
        <h3 class="text-lg font-medium text-slate-300">Total Employees</h3>
        <p class="mt-1 text-4xl font-semibold text-sky-400">{{ employeeStore.employees.length }}</p>
        <p class="text-sm text-slate-500 mt-2">Managed within IntelliPath</p>
      </div>
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
        <h3 class="text-lg font-medium text-slate-300">Paths In Progress</h3>
        <p class="mt-1 text-4xl font-semibold text-teal-400">{{ pathsInProgress }}</p>
         <p class="text-sm text-slate-500 mt-2">Active learning journeys</p>
      </div>
      <div class="card-intellipath p-6 transform hover:scale-105 transition-transform duration-300">
        <h3 class="text-lg font-medium text-slate-300">Completed Paths</h3>
        <p class="mt-1 text-4xl font-semibold text-emerald-400">{{ pathsCompleted }}</p>
        <p class="text-sm text-slate-500 mt-2">Successfully finished</p>
      </div>
    </div>

    <div>
      <h2 class="text-2xl font-semibold text-slate-200 mb-4">Employee Overview</h2>
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
        <EmployeeListItem
          v-for="employee in employeeStore.employees"
          :key="employee.id"
          :employee="employee"
          class="transform hover:scale-[1.02] transition-transform duration-300 ease-out"
        />
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="showAddEmployeeModal" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
           @click.self="closeModal"> 
        <div class="card-intellipath w-full max-w-lg p-6 md:p-8 transform transition-all duration-300 ease-out"
             role="dialog" 
             aria-modal="true" 
             aria-labelledby="add-employee-modal-title">
          <EmployeeForm @success="handleEmployeeAdded" @cancel="closeModal"/>
        </div>
      </div>
    </Transition>

  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useEmployeeStore } from '../stores/employeeStore'; 
import EmployeeListItem from '../components/employees/EmployeeListItem.vue';
import EmployeeForm from '../components/employees/EmployeeForm.vue'; 

const employeeStore = useEmployeeStore();
const showAddEmployeeModal = ref(false);
const initialLoadComplete = ref(false); 

onMounted(async () => {
  console.log("LDDashboardView: Mounted. Fetching employees...");
  await employeeStore.fetchEmployees();
  initialLoadComplete.value = true;
  console.log("LDDashboardView: Employees fetched. Count:", employeeStore.employees.length);
});

const pathsInProgress = computed(() => {
  if (!employeeStore.employees) return 0;
  return employeeStore.employees.filter(e => e.learningPath && (e.learningPath.status === 'assigned' || e.learningPath.status === 'in_progress')).length;
});
const pathsCompleted = computed(() => {
  if (!employeeStore.employees) return 0;
  return employeeStore.employees.filter(e => e.learningPath && e.learningPath.status === 'completed').length;
});

const openAddEmployeeModal = () => {
  console.log("LDDashboardView: openAddEmployeeModal called.");
  showAddEmployeeModal.value = true;
  console.log("LDDashboardView: showAddEmployeeModal is now:", showAddEmployeeModal.value);
};

const handleEmployeeAdded = async () => {
  console.log("LDDashboardView: handleEmployeeAdded called (form success).");
  showAddEmployeeModal.value = false;

  await employeeStore.fetchEmployees(); 
  console.log("LDDashboardView: Employees re-fetched after adding.");
};

const closeModal = () => {
  console.log("LDDashboardView: closeModal called.");
  showAddEmployeeModal.value = false;
  if (employeeStore.error) {
    employeeStore.error = null;
  }
  console.log("LDDashboardView: showAddEmployeeModal is now:", showAddEmployeeModal.value);
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