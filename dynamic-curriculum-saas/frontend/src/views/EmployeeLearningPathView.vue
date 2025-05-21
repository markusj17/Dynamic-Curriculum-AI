<template>
  <div class="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-slate-200 flex flex-col items-center pt-10 md:pt-16 px-4 pb-16">
    <div class="w-full max-w-3xl space-y-6">
      <div class="text-center mb-8">
        <router-link to="/" class="inline-block mb-4"> {/* Or back to a relevant public page if not logged in */}
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

      <div v-else-if="learningPath && (learningPath.status === 'assigned' || learningPath.status === 'in_progress' || learningPath.status === 'completed') && learningPath.path_data && learningPath.path_data.length > 0">
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
              @toggle-complete="handleStepToggle"
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
          <p class="text-slate-400 mt-1">Please check back soon!</p>
      </div>
      
      <div v-else class="card-intellipath p-10 text-center">
        <h2 class="text-2xl font-semibold text-slate-300 mb-3">No Learning Path Available</h2>
        <p class="text-slate-400">A learning path has not been assigned to you yet, or it might be empty.</p>
        <p class="text-slate-400 mt-1">Please contact your L&D manager if you believe this is an error.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import learningPathService from '../services/learningPathService'; // Make sure path is correct
import logoUrl from '../assets/intellipath-logo.png';       // Make sure path is correct
import PathDisplayStepLearnerView from '../components/learning-paths/PathDisplayStepLearnerView.vue'; // Make sure path is correct

const route = useRoute();
const learningPath = ref(null);
const employeeName = ref('');
const isLoading = ref(true);
const error = ref(null);

const employeeIdForPath = computed(() => route.params.employeeId);

const fetchPath = async () => {
  if (!employeeIdForPath.value) {
    error.value = "Employee identifier missing from URL.";
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  error.value = null;
  try {
    // API endpoint should ideally return associated employee name if possible
    // or learningPath object should have an 'employee' relation.
    const response = await learningPathService.getLearningPathForEmployee(employeeIdForPath.value);
    if (response.data) {
        learningPath.value = response.data;
        // Attempt to get employee name from the path object or a nested employee object
        employeeName.value = response.data?.employee?.name || '';
        if (!employeeName.value && response.data?.path_data?.length > 0) {
            // Fallback if name isn't directly available but path exists
            // This part might need adjustment based on your actual API response structure
            console.warn("Employee name not found directly in learning path response.");
        }
    } else {
        // Handle cases where response.data might be null or undefined but no error thrown
        error.value = "Learning path data not found or invalid response from server.";
        learningPath.value = null;
    }
  } catch (err) {
    console.error("Error fetching learning path for learner:", err);
    error.value = err.response?.data?.message || "Could not load your learning path. Please try again later.";
    learningPath.value = null;
  } finally {
    isLoading.value = false;
  }
};

const allStepsCompleted = computed(() => {
    return learningPath.value && 
           learningPath.value.path_data && 
           learningPath.value.path_data.length > 0 && // Ensure there are steps
           learningPath.value.path_data.every(step => step.completed);
});

onMounted(() => {
  fetchPath();
});

// Watch for changes in route param if user navigates between different employee paths (less common for this view)
watch(employeeIdForPath, (newId, oldId) => {
    if (newId && newId !== oldId) {
        fetchPath();
    }
});

const handleStepToggle = async (stepIndex, completedStatus) => {
    if (!learningPath.value || !learningPath.value.id || !learningPath.value.path_data || typeof learningPath.value.path_data[stepIndex] === 'undefined') {
        console.error("Cannot toggle step: path or step data missing.");
        return;
    }
    
    const originalStatus = learningPath.value.path_data[stepIndex].completed;
    learningPath.value.path_data[stepIndex].completed = completedStatus; // Optimistic UI update

    try {
        const updatedPathResponse = await learningPathService.updateStepStatus(
            learningPath.value.id, 
            stepIndex, 
            completedStatus
        );
        // Update local learningPath with the full response from backend to ensure consistency
        learningPath.value = updatedPathResponse.data; 
        // Re-evaluate employeeName if it might come from the updated path data
        employeeName.value = updatedPathResponse.data?.employee?.name || employeeName.value;
    } catch (err) {
        console.error("Error updating step status for learner:", err);
        alert("Failed to save your progress. Please try again.");
        // Revert optimistic update if API call fails
        if (learningPath.value && learningPath.value.path_data[stepIndex]) {
            learningPath.value.path_data[stepIndex].completed = originalStatus;
        }
    }
};
</script>