<template>
  <form @submit.prevent="submitForm" class="space-y-6">
    <h3 class="text-xl font-semibold leading-6 text-sky-400">{{ isEditing ? 'Edit Employee Details' : 'Add New Employee' }}</h3>
    <div>
      <label for="name" class="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
      <input type="text" v-model="formData.name" id="name" required class="input-field-intellipath" placeholder="e.g., Ada Lovelace"/>
    </div>
    <div>
      <label for="email" class="block text-sm font-medium text-slate-300 mb-1">Email (Optional)</label>
      <input type="email" v-model="formData.email" id="email" class="input-field-intellipath" placeholder="e.g., ada@example.com"/>
    </div>
    <div>
      <label for="current_role" class="block text-sm font-medium text-slate-300 mb-1">Current Role</label>
      <input type="text" v-model="formData.current_role" id="current_role" class="input-field-intellipath" placeholder="e.g., Software Engineer"/>
    </div>
    <div>
      <label for="current_skills" class="block text-sm font-medium text-slate-300 mb-1">Current Skills</label>
      <textarea v-model="formData.current_skills" id="current_skills" rows="3" class="input-field-intellipath" placeholder="e.g., Python, JavaScript, Project Management"></textarea>
       <p class="mt-1 text-xs text-slate-500">Enter skills, comma-separated or one per line.</p>
    </div>
    <div>
      <label for="desired_skills_goal" class="block text-sm font-medium text-slate-300 mb-1">Desired Skills / Career Goal</label>
      <textarea v-model="formData.desired_skills_goal" id="desired_skills_goal" rows="3" class="input-field-intellipath" placeholder="e.g., Become a Lead Data Scientist, Learn Cloud Architecture"></textarea>
    </div>
    <div class="pt-2 flex flex-col sm:flex-row-reverse sm:justify-start gap-3">
        <button type="submit" class="btn-intellipath-primary w-full sm:w-auto" :disabled="employeeStore.isLoading">
            <span v-if="employeeStore.isLoading">Saving...</span>
            <span v-else>{{ isEditing ? 'Update Employee' : 'Add Employee' }}</span>
        </button>
        <button type="button" @click="$emit('cancel')" class="btn-intellipath-secondary w-full sm:w-auto">Cancel</button>
    </div>
    <p v-if="employeeStore.error" class="text-sm text-red-400">{{ employeeStore.error }}</p>
  </form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { useEmployeeStore } from '../../stores/employeeStore';

const props = defineProps({
  employee: Object,
});
const emit = defineEmits(['success', 'cancel']);

const employeeStore = useEmployeeStore();
const isEditing = ref(false);
const formData = ref({
  name: '',
  email: '',
  current_role: '',
  current_skills: '',
  desired_skills_goal: '',
});

watch(() => props.employee, (newVal) => {
  if (newVal && newVal.id) {
    isEditing.value = true;
    formData.value = { ...newVal };
  } else {
    isEditing.value = false;
    formData.value = { name: '', email: '', current_role: '', current_skills: '', desired_skills_goal: '' };
  }
}, { immediate: true });

const submitForm = async () => {
  try {
    if (isEditing.value && props.employee) { 
      await employeeStore.updateEmployee(props.employee.id, formData.value);
    } else {
      await employeeStore.addEmployee(formData.value);
    }
    emit('success');
  } catch (error) {
    console.error("Employee form submission error:", error);
  }
};
</script>