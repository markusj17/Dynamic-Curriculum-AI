<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-slate-200 flex flex-col items-center pt-10 md:pt-16 px-4 pb-16">
    <div class="w-full max-w-3xl space-y-6">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block mb-4">
          <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-10 w-auto" />
        </router-link>
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          Your Personalized Learning Path
        </h1>
        <p v-if="employeeName" class="mt-2 text-sm text-slate-400">Tailored for: {{ employeeName }}</p>
        <p v-else-if="!isLoading && !error" class="mt-2 text-sm text-slate-400">Follow these steps to achieve your learning goals.</p>
      </div>

      <div v-if="isLoading" class="card-intellipath p-8 text-center">
        <div class="flex justify-center items-center space-x-3">
          <svg class="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-slate-300 text-lg">Loading your learning path...</p>
        </div>
      </div>
      <div v-else-if="error" class="card-intellipath bg-red-800/30 border-red-700 p-6 text-red-300">
        <h2 class="text-xl font-semibold mb-2 text-red-400">Oops! Something went wrong.</h2>
        <p>{{ error }}</p>
        <p class="mt-2 text-xs">If this persists, please contact your L&D manager or support.</p>
      </div>
      <div v-else-if="learningPath && ['assigned', 'in_progress', 'completed'].includes(learningPath.status) && learningPath.path_data && learningPath.path_data.length > 0">
        <div class="space-y-5">
          <div v-for="(step, index) in learningPath.path_data" :key="step.id || `step-learner-${index}`"
               class="card-intellipath p-5 transition-all duration-300 ease-in-out"
               :class="{
                 'opacity-60 border-l-4 border-emerald-600 bg-slate-800/50 hover:opacity-100': step.completed,
                 'border-l-4 border-sky-500 hover:border-sky-400': !step.completed
               }">
            <PathDisplayStepLearnerView 
              :step-data="step" 
              :index="index"
              :employee-id="props.employeeId"
              :learning-path-id="learningPath.id"
              @step-completion-updated="refreshPathData" 
            />
          </div>
        </div>
        <div v-if="allStepsCompleted" class="mt-10 text-center card-intellipath bg-emerald-600/30 border-emerald-500 p-6">
            <div class="text-5xl mb-3">🎉</div>
            <h2 class="text-2xl font-semibold text-emerald-300">Path Completed!</h2>
            <p class="text-slate-300 mt-1">Fantastic work, {{ employeeName || 'learner' }}! You've successfully completed all steps.</p>
        </div>
      </div>
      <div v-else-if="learningPath && learningPath.status === 'draft'" class="card-intellipath p-10 text-center">
          <h2 class="text-2xl font-semibold text-slate-300 mb-3">Path Not Yet Ready</h2>
          <p class="text-slate-400">Your personalized learning path is currently being prepared or is under review.</p>
      </div>
      <div v-else class="card-intellipath p-10 text-center">
        <h2 class="text-2xl font-semibold text-slate-300 mb-3">No Learning Path Available</h2>
        <p class="text-slate-400">A learning path has not been assigned to you, or it might be empty.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import learningPathService from '../services/learningPathService';
import logoUrl from '../assets/intellipath-logo.png';
import PathDisplayStepLearnerView from '../components/learning-paths/PathDisplayStepLearnerView.vue';

const props = defineProps({
  employeeId: { type: [String, Number], required: true } // From router props: true
});

const route = useRoute(); // Still useful for other route info if needed
const learningPath = ref(null);
const employeeName = ref('');
const isLoading = ref(true);
const error = ref(null);

const fetchPath = async () => {
  if (!props.employeeId) { // Use prop directly
    error.value = "Employee identifier missing.";
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    const response = await learningPathService.getLearningPathForEmployee(props.employeeId);
    if (response.data) {
        learningPath.value = response.data;
        employeeName.value = response.data?.employee?.name || '';
         // Ensure path_data steps have a 'completed' field
        if (learningPath.value.path_data && Array.isArray(learningPath.value.path_data)) {
            learningPath.value.path_data = learningPath.value.path_data.map((step, index) => ({
                id: step.id || `step_learner_view_${index}`, // Ensure an ID for keying
                completed: typeof step.completed === 'boolean' ? step.completed : false,
                ...step,
            }));
        } else {
            learningPath.value.path_data = [];
        }

    } else {
        error.value = "Learning path data not found.";
        learningPath.value = null;
    }
  } catch (err) {
    error.value = err.response?.data?.message || "Could not load your learning path.";
    learningPath.value = null;
  } finally {
    isLoading.value = false;
  }
};

const allStepsCompleted = computed(() => (
    learningPath.value?.path_data?.length > 0 &&
    learningPath.value.path_data.every(step => step.completed)
));

// This function will be called when PathDisplayStepLearnerView emits 'step-completion-updated'
const refreshPathData = async (updatedStepData) => {
    console.log("EmployeeLearningPathView: Received step-completion-updated, new step data:", updatedStepData);
    // Find the step in our local learningPath.path_data and update it
    // This is if the child component doesn't get the full path back, only its own status
    // Or, simply re-fetch the whole path for simplicity and guaranteed consistency
    // For now, let's assume the child component updated its own state,
    // and we just need to update our local copy of that specific step if the event passes it.
    // A more robust way if the child doesn't return the *entire* updated path object from the backend
    // is to re-fetch the whole path here.
    if (learningPath.value && learningPath.value.path_data) {
        const stepIndex = learningPath.value.path_data.findIndex(s => s.id === updatedStepData.id || (s.title === updatedStepData.topic && s.description === updatedStepData.description)); // Fallback match
        if (stepIndex !== -1) {
            learningPath.value.path_data[stepIndex] = { ...learningPath.value.path_data[stepIndex], ...updatedStepData };
            // Re-evaluate if all steps completed
            if (allStepsCompleted.value && learningPath.value.status !== 'completed') {
                 learningPath.value.status = 'completed'; // Optimistic UI for path status
            }
        } else {
            // If step not found (shouldn't happen if IDs are stable), re-fetch for safety
            await fetchPath();
        }
    } else {
        await fetchPath(); // Path data missing, re-fetch
    }
};


onMounted(fetchPath);
watch(() => props.employeeId, fetchPath); // Re-fetch if employeeId prop changes
</script>