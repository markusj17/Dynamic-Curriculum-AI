<template>
  <div class="p-4 md:p-8 space-y-8">
    <div v-if="employeeStore.isLoading && !employeeStore.currentEmployee" class="card-intellipath p-10 text-center">
      <p class="text-slate-400 animate-pulse">Loading employee details...</p>
    </div>
    <div v-else-if="employeeStore.error && !employeeStore.currentEmployee" class="card-intellipath p-6 text-red-400 bg-red-900/30">
      <h2 class="text-xl font-semibold mb-2">Error Loading Employee</h2>
      <p>{{ employeeStore.error }}</p>
      <router-link to="/dashboard" class="btn-intellipath-secondary mt-4 inline-block">
        Back to Dashboard
      </router-link>
    </div>

    <div v-else-if="employee" class="space-y-8">
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 class="text-3xl md:text-4xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
            {{ employee.name }}
          </h1>
          <p class="text-slate-400 text-lg mt-1">{{ employee.current_role || 'Role not specified' }}</p>
        </div>
        <div class="flex-shrink-0 flex gap-3">
          <button @click="showEditEmployeeModal = true" class="btn-intellipath-secondary">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z"></path><path fill-rule="evenodd" d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" clip-rule="evenodd"></path></svg>
            Edit Info
          </button>
          <button @click="confirmDeleteEmployee" class="btn-intellipath-danger">
            <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"></path></svg>
            Delete
          </button>
        </div>
      </header>

      <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2">
          Employee Information
        </h2>
        <dl class="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
          <div>
            <dt class="text-sm font-medium text-slate-400">Email</dt>
            <dd class="mt-1 text-slate-200">{{ employee.email || 'N/A' }}</dd>
          </div>
          <div>
            <dt class="text-sm font-medium text-slate-400">Company Role</dt> <!-- Changed label -->
            <dd class="mt-1 text-slate-200">{{ employee.current_role || 'N/A' }}</dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-slate-400">Current Skills</dt>
            <dd class="mt-1 text-slate-300 bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap text-sm leading-relaxed min-h-[60px]">
              {{ employee.current_skills || 'No skills listed.' }}
            </dd>
          </div>
          <div class="sm:col-span-2">
            <dt class="text-sm font-medium text-slate-400">Desired Skills / Career Goal</dt>
            <dd class="mt-1 text-slate-300 bg-slate-800/50 p-3 rounded-md whitespace-pre-wrap text-sm leading-relaxed min-h-[60px]">
              {{ employee.desired_skills_goal || 'No goals specified.' }}
            </dd>
          </div>
        </dl>
      </div>

      <div class="card-intellipath p-6 md:p-8">
        <h2 class="text-xl font-semibold mb-4 text-sky-400 border-b border-slate-700 pb-2">
          Learning Path
        </h2>

        <PathGeneratorForm :employee="employee" />
      </div>

    </div>

    <div v-else class="card-intellipath p-10 text-center">
        <p class="text-slate-300 text-lg">Employee data not found.</p>
        <router-link to="/dashboard" class="btn-intellipath-secondary mt-4 inline-block">
          Back to Dashboard
        </router-link>
    </div>

    <Transition name="modal-fade">
      <div v-if="showEditEmployeeModal && employee" 
           class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4"
           @click.self="closeEditModal">
        <div class="card-intellipath w-full max-w-lg p-6 md:p-8"
             role="dialog" aria-modal="true" aria-labelledby="edit-employee-modal-title">
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

const fetchEmployeeData = async (id) => {
  console.log("EmployeeDetailView: Fetching data for employee ID:", id);
  await employeeStore.fetchEmployeeById(id);
  console.log("EmployeeDetailView: Employee data fetched:", employeeStore.currentEmployee);
};

onMounted(() => {
  if (employeeId.value) {
    fetchEmployeeData(employeeId.value);
  }
});

watch(employeeId, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchEmployeeData(newId);
    }
});

const handleEmployeeUpdated = async () => {
  showEditEmployeeModal.value = false;
  if (employeeId.value) {
    await fetchEmployeeData(employeeId.value); 
  }
  console.log("EmployeeDetailView: Employee info updated.");
};
const closeEditModal = () => {
    showEditEmployeeModal.value = false;
    if(employeeStore.error) employeeStore.error = null; 
};

const confirmDeleteEmployee = async () => {
    if (employee.value && window.confirm(`Are you sure you want to delete ${employee.value.name}? This action cannot be undone and will remove their learning path.`)) {
        const success = await employeeStore.deleteEmployee(employee.value.id);
        if (success) {
            alert(`${employee.value.name} has been deleted.`);
            router.push('/dashboard');
        } else {
            alert(`Failed to delete employee: ${employeeStore.error || 'Unknown error. Check console.'}`);
        }
    }
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