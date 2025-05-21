<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-8">
    <!-- Loading State -->
    <div v-if="employeeStore.isLoading && !employeeStore.currentEmployee && !initialError" class="card-intellipath p-10 text-center">
      <div class="flex justify-center items-center space-x-3">
        <svg class="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p class="text-slate-300 text-lg">Loading employee details...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="initialError" class="card-intellipath p-6 md:p-8 text-red-300 bg-red-900/40">
      <h2 class="text-2xl font-semibold mb-3 text-red-400">Error Loading Employee</h2>
      <p class="mb-4">{{ initialError }}</p>
      <router-link to="/dashboard" class="btn-intellipath-secondary !py-2 !px-4 text-sm">
        Back to Dashboard
      </router-link>
    </div>

    <!-- Main Content if Employee Loaded -->
    <div v-else-if="employee" class="space-y-8">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            {{ employee.name }}
          </h1>
          <p class="text-slate-400 text-lg mt-1">{{ employee.current_role || 'Role not specified' }}</p>
        </div>
        <div class="flex-shrink-0 flex gap-3">
          <button @click="openEditEmployeeModal" class="btn-intellipath-secondary flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Edit Info
          </button>
          <button @click="confirmDeleteEmployee" class="btn-intellipath-danger flex items-center">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            Delete
          </button>
        </div>
      </header>

      <!-- Employee Information Card -->
      <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-3">
          Employee Information
        </h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
          <div>
            <dt class="font-medium text-slate-400">Email</dt>
            <dd class="mt-1 text-slate-200">{{ employee.email || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="font-medium text-slate-400">Current Role</dt>
            <dd class="mt-1 text-slate-200">{{ employee.current_role || 'N/A' }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="font-medium text-slate-400">Current Skills</dt>
            <dd class="mt-1 text-slate-300 bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed min-h-[4rem]">
              {{ employee.current_skills || 'No skills listed.' }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="font-medium text-slate-400">Desired Skills / Career Goal</dt>
            <dd class="mt-1 text-slate-300 bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap leading-relaxed min-h-[4rem]">
              {{ employee.desired_skills_goal || 'No goals specified.' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-0 text-sky-400 border-b border-slate-700 pb-3"> 
          Learning Path Management
        </h2>
        <PathGeneratorForm :employee="employee" class="mt-4" />
      </div>
    </div>

    <div v-else class="card-intellipath p-10 text-center">
        <p class="text-slate-300 text-lg">Employee data not found.</p>
        <router-link to="/dashboard" class="btn-intellipath-secondary mt-4 inline-block">
          Back to Dashboard
        </router-link>
    </div>

    <!-- Edit Employee Modal -->
    <Transition name="modal-fade">
      <div v-if="showEditEmployeeModal && employee" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
           @click.self="closeEditModal">
        <div class="card-intellipath w-full max-w-lg p-6 md:p-8" role="dialog" aria-modal="true">
          <EmployeeForm :employee="employee" @success="handleEmployeeUpdated" @cancel="closeEditModal"/>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useEmployeeStore } from '../stores/employeeStore';
import PathGeneratorForm from '../components/learning-paths/PathGeneratorForm.vue';
import EmployeeForm from '../components/employees/EmployeeForm.vue';

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore();
const employeeId = computed(() => route.params.id);

const employee = computed(() => employeeStore.currentEmployee);
const showEditEmployeeModal = ref(false);
const initialError = ref(null); 

const fetchEmployeeData = async (id) => {
  initialError.value = null;
  try {
    await employeeStore.fetchEmployeeById(id);
    if (!employeeStore.currentEmployee) {
      initialError.value = "Employee record could not be loaded or does not exist.";
    }
  } catch (err) {
    initialError.value = err.message || "An error occurred while fetching employee data.";
  }
};

onMounted(() => {
  if (employeeId.value) {
    fetchEmployeeData(employeeId.value);
  } else {
    initialError.value = "No employee ID provided in the route.";
  }
});

watch(employeeId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchEmployeeData(newId);
    }
});

const openEditEmployeeModal = () => {
  showEditEmployeeModal.value = true;
};
const handleEmployeeUpdated = async () => {
  showEditEmployeeModal.value = false;
  if (employeeId.value) {
    await fetchEmployeeData(employeeId.value); 
  }
};
const closeEditModal = () => {
    showEditEmployeeModal.value = false;
    if(employeeStore.error && employeeStore.error.startsWith("Validation failed")) { 

    }
};
const confirmDeleteEmployee = async () => {
    if (employee.value && window.confirm(`Are you sure you want to delete ${employee.value.name}? This action cannot be undone and will remove their learning path.`)) {
        const success = await employeeStore.deleteEmployee(employee.value.id);
        if (success) {
            alert(`${employee.value.name} has been deleted.`);
            router.push('/dashboard');
        } else {
            alert(`Failed to delete employee: ${employeeStore.error || 'Unknown error.'}`);
        }
    }
};
</script>

<style scoped>
.modal-fade-enter-active, /* Ensure these are defined globally or here */
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