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
        <EmployeeListItem
          v-for="employee in employeeStore.employees"
          :key="employee.id"
          :employee="employee"
          @regenerate-creds="handleRegenerateRequest" 
          class="transform hover:-translate-y-1 transition-transform duration-300 ease-out"
        />
      </div>
    </div>

    <Transition name="modal-fade">
      <div v-if="showAddEmployeeModal" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
           @click.self="closeAddModal">
        <div class="card-intellipath w-full max-w-lg p-6 md:p-8" role="dialog" aria-modal="true">
          <EmployeeForm @success="handleEmployeeAdded" @cancel="closeAddModal"/>
        </div>
      </div>
    </Transition>

    <Transition name="modal-fade">
      <div v-if="employeeStore.newlyCreatedEmployeeCredentials"
           class="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/90 backdrop-blur-md p-4">
        <div class="card-intellipath w-full max-w-md p-6 md:p-8 text-center space-y-4">
          <div class="flex justify-center mb-2">
            <svg class="w-12 h-12 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.588-3.757z" /></svg>
          </div>
          <h3 class="text-xl font-semibold text-sky-300">Employee Credentials Generated!</h3>
          <p class="text-sm text-slate-300">
            Please securely share the following credentials with
            <strong class="text-sky-300">{{ employeeStore.newlyCreatedEmployeeCredentials.employeeName }}</strong>.
            They will need these to log in for the first time.
          </p>
          <div class="space-y-3 text-left bg-slate-800/60 p-4 rounded-lg border border-slate-700">
              <div class="flex justify-between items-center">
                  <p class="text-sm text-slate-400">Username:</p>
                  <p class="font-mono text-slate-100 text-sm bg-slate-700 px-2 py-1 rounded">{{ employeeStore.newlyCreatedEmployeeCredentials.username }}</p>
              </div>
              <div class="flex justify-between items-center">
                  <p class="text-sm text-slate-400">Temporary Password:</p>
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
          <p class="text-xs text-yellow-400/80 pt-2">This password is shown only once. Advise the employee to change it upon their first login.</p>
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
const copyButtonText = ref('Copy Credentials');

onMounted(async () => {
  await employeeStore.fetchEmployees();
  initialLoadComplete.value = true;
});

const pathsInProgress = computed(() => { /* ... */ });
const pathsCompleted = computed(() => { /* ... */ });

const openAddEmployeeModal = () => {
  employeeStore.error = null; // Clear any previous form errors from store
  showAddEmployeeModal.value = true;
};

const handleEmployeeAdded = async () => {
  showAddEmployeeModal.value = false; // Close add form modal
  // The newlyCreatedEmployeeCredentials will now be in the store, triggering the other modal.
  await employeeStore.fetchEmployees(); 
};

const closeAddModal = () => {
  showAddEmployeeModal.value = false;
  if (employeeStore.error) employeeStore.error = null;
};

const acknowledgeCredentials = () => {
    employeeStore.clearNewCredentials();
    copyButtonText.value = 'Copy Credentials'; // Reset button text
};

const copyCredentialsToClipboard = async () => {
    if (!employeeStore.newlyCreatedEmployeeCredentials) return;
    const creds = employeeStore.newlyCreatedEmployeeCredentials;
    const textToCopy = `IntelliPath Employee Login:\nEmployee: ${creds.employeeName}\nUsername: ${creds.username}\nTemporary Password: ${creds.password}`;
    try {
        await navigator.clipboard.writeText(textToCopy);
        copyButtonText.value = 'Copied!';
        setTimeout(() => { copyButtonText.value = 'Copy Credentials'; }, 2500);
    } catch (err) {
        console.error('Failed to copy credentials: ', err);
        // Fallback for older browsers or if clipboard API fails
        prompt("Failed to auto-copy. Please copy manually:", textToCopy);
    }
};

const handleRegenerateRequest = async (employeeId) => {
    if (!window.confirm("Are you sure you want to regenerate credentials for this employee? Their old password will stop working immediately.")) {
        return;
    }
    copyButtonText.value = 'Copy Credentials'; // Reset in case it was 'Copied!'
    try {
        const success = await employeeStore.regenerateCredentials(employeeId);
        if (!success) { // If store action returns false on API error
             alert("Failed to regenerate credentials. " + (employeeStore.error || 'Please check server logs.'));
        }
        // If successful, the newlyCreatedEmployeeCredentials in store will show the modal
    } catch (err) { // Catch errors re-thrown by store action
        alert("Error during credential regeneration: " + (employeeStore.error || err.message || 'Unknown error'));
    }
};
</script>

<style scoped>
.modal-fade-enter-active, .modal-fade-leave-active { transition: opacity 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02); }
.modal-fade-enter-active .card-intellipath, .modal-fade-leave-active .card-intellipath { transition: all 0.3s cubic-bezier(0.52, 0.02, 0.19, 1.02); }
.modal-fade-enter-from, .modal-fade-leave-to { opacity: 0; }
.modal-fade-enter-from .card-intellipath, .modal-fade-leave-to .card-intellipath { transform: scale(0.95) translateY(-20px); opacity: 0; }
</style>