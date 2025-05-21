<template>
  <div class="p-4 md:p-6 lg:p-8 space-y-8">
    <div v-if="employeeStore.isLoading && !employeeStore.currentEmployee && !initialError" class="card-intellipath ..."></div>
    <div v-else-if="initialError" class="card-intellipath ..."></div>

    <div v-else-if="employee" class="space-y-8">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            {{ employee.name }}
          </h1>
          <p class="text-slate-400 text-lg mt-1">{{ employee.current_role || 'Role not specified' }}</p>
          <p class="text-xs text-slate-500 mt-0.5" :title="employee.username">Login: {{ employee.username }}</p>
        </div>
        <div class="flex-shrink-0 flex flex-wrap gap-3">
          <button @click="openEditEmployeeModal" class="btn-intellipath-secondary flex items-center text-sm !py-2">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Edit Info
          </button>
          <button 
            @click="handleRegenerateRequest(employee.id)" 
            class="btn-intellipath-secondary !border-yellow-600/50 hover:!border-yellow-500 !text-yellow-400 hover:!text-yellow-300 text-sm !py-2 flex items-center"
            title="Regenerate login credentials for this employee">
            <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
            Regen Credentials
          </button>
          <button @click="confirmDeleteEmployee" class="btn-intellipath-danger flex items-center text-sm !py-2">
            <svg class="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            Delete
          </button>
        </div>
      </header>

       <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-3">
          Employee Information
        </h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm">
        </dl>
      </div>
      <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-0 text-sky-400 border-b border-slate-700 pb-3"> 
          Learning Path Management
        </h2>
        <PathGeneratorForm :employee="employee" class="mt-4" />
      </div>

    </div>
    <div v-else class="card-intellipath ..."></div> 

    <Transition name="modal-fade">
    </Transition>

    <Transition name="modal-fade">
      <div v-if="employeeStore.newlyCreatedEmployeeCredentials && employeeStore.newlyCreatedEmployeeCredentials.employeeName === employee?.name"
           class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
        <div class="card-intellipath w-full max-w-md p-6 md:p-8 text-center space-y-4">
          <div class="flex justify-center mb-2">
            <svg class="w-12 h-12 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.588-3.757z" /></svg>
          </div>
          <h3 class="text-xl font-semibold text-sky-300">Credentials Regenerated!</h3>
          <p class="text-sm text-slate-300">
            Please securely share the following new credentials with
            <strong class="text-sky-300">{{ employeeStore.newlyCreatedEmployeeCredentials.employeeName }}</strong>.
            Their old password no longer works.
          </p>
          <div class="space-y-3 text-left bg-slate-800/60 p-4 rounded-lg border border-slate-700">
              <div class="flex justify-between items-center">
                  <p class="text-sm text-slate-400">Username:</p>
                  <p class="font-mono text-slate-100 text-sm bg-slate-700 px-2 py-1 rounded">{{ employeeStore.newlyCreatedEmployeeCredentials.username }}</p>
              </div>
              <div class="flex justify-between items-center">
                  <p class="text-sm text-slate-400">New Temporary Password:</p>
                  <p class="font-mono text-slate-100 text-sm bg-slate-700 px-2 py-1 rounded">{{ employeeStore.newlyCreatedEmployeeCredentials.password }}</p>
              </div>
          </div>
          <div class="flex flex-col sm:flex-row gap-3 pt-2">
              <button @click="copyCredentialsToClipboard" class="btn-intellipath-secondary w-full flex items-center justify-center text-sm !py-2">
                  <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                  {{ copyButtonText }}
              </button>
              <button @click="acknowledgeCredentials" class="btn-intellipath-primary w-full text-sm !py-2">
                  Acknowledge & Close
              </button>
          </div>
          <p class="text-xs text-yellow-400/80 pt-2">Advise the employee to change this password upon their first login.</p>
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

const acknowledgeCredentials = () => {
    employeeStore.clearNewCredentials();
    copyButtonText.value = 'Copy Credentials';
};

const copyCredentialsToClipboard = async () => {
    if (!employeeStore.newlyCreatedEmployeeCredentials) return;
    const creds = employeeStore.newlyCreatedEmployeeCredentials;
    const textToCopy = `IntelliPath Employee Login:\nEmployee: ${creds.employeeName}\nUsername: ${creds.username}\nNew Password: ${creds.password}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        copyButtonText.value = 'Copied!';
        setTimeout(() => { copyButtonText.value = 'Copy Credentials'; }, 2500);
    } catch (err) {
        prompt("Failed to auto-copy. Please copy manually:", textToCopy);
    }
};

const handleRegenerateRequest = async (idOfEmployeeToRegenerate) => {
    if (!window.confirm("Are you sure you want to regenerate credentials for this employee? Their old password will stop working immediately.")) {
        return;
    }
    copyButtonText.value = 'Copy Credentials';
    try {
        // Make sure newlyCreatedEmployeeCredentials only shows if it's for THIS employee
        // This is handled by the v-if on the modal using employeeName comparison
        await employeeStore.regenerateCredentials(idOfEmployeeToRegenerate);
    } catch (err) {
        alert("Error regenerating credentials: " + (employeeStore.error || err.message || 'Unknown error'));
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