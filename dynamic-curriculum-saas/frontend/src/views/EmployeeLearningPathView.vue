<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center pt-10 md:pt-16 px-4">
    <div class="w-full max-w-3xl space-y-6">
      <div class="text-center mb-8">
        <router-link to="/"> <!-- Or back to a learner-specific dashboard if you make one -->
          <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-10 w-auto mb-3" />
        </router-link>
        <h1 class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">
          Your Learning Path
        </h1>
        <p v-if="employeeName" class="mt-2 text-sm text-slate-400">For: {{ employeeName }}</p>
      </div>

      <div v-if="isLoading" class="card-intellipath p-8 text-center">
        <p class="text-slate-300 animate-pulse">Loading your learning path...</p>
      </div>
      <div v-else-if="error" class="card-intellipath bg-red-800/30 border-red-700 p-6 text-red-300">
        <h2 class="text-xl font-semibold mb-2">Error Loading Path</h2>
        <p>{{ error }}</p>
        <p class="mt-2 text-xs">Please contact your L&D manager or try again later.</p>
      </div>
      <div v-else-if="learningPath && (learningPath.status === 'assigned' || learningPath.status === 'in_progress') && learningPath.path_data && learningPath.path_data.length > 0">
        <div class="space-y-5">
          <div v-for="(step, index) in learningPath.path_data" :key="step.topic + '-' + index" 
               class="card-intellipath p-5 transition-all duration-300"
               :class="step.completed ? 'opacity-70 border-l-4 border-emerald-500' : 'border-l-4 border-sky-500'">
            <PathDisplayStepLearnerView 
              :step-data="step" 
              :index="index"
              @toggle-complete="handleStepToggle"
            />
          </div>
        </div>
         <p v-if="allStepsCompleted" class="mt-8 text-center text-lg text-emerald-400 font-semibold">
            🎉 Congratulations! You've completed all steps in this learning path! 🎉
        </p>
      </div>
      <div v-else-if="learningPath && learningPath.status === 'draft'" class="card-intellipath p-10 text-center">
          <h2 class="text-2xl font-semibold text-slate-300 mb-3">Path In Preparation</h2>
          <p class="text-slate-400">Your learning path is currently being prepared or reviewed by your L&D manager.</p>
          <p class="text-slate-400 mt-1">Please check back soon!</p>
      </div>
      <div v-else-if="learningPath && learningPath.status === 'completed'" class="card-intellipath p-10 text-center">
          <h2 class="text-2xl font-semibold text-emerald-400 mb-3">🎉 Path Completed! 🎉</h2>
          <p class="text-slate-300">Well done on finishing your learning path for {{ employeeName || 'this topic' }}.</p>
      </div>
      <div v-else class="card-intellipath p-10 text-center">
        <h2 class="text-2xl font-semibold text-slate-300 mb-3">No Learning Path Found</h2>
        <p class="text-slate-400">A learning path has not been assigned to you, or it might be empty.</p>
        <p class="text-slate-400 mt-1">Please contact your L&D manager if you believe this is an error.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import learningPathService from '../services/learningPathService';
import logoUrl from '../assets/intellipath-logo.png';
// You'll need a specific component to display steps for learners, or adapt PathStep.vue
// For now, let's assume a new component:
import PathDisplayStepLearnerView from '../components/learning-paths/PathDisplayStepLearnerView.vue'; 

const route = useRoute();
const learningPath = ref(null);
const employeeName = ref(''); // To display "Path for [Employee Name]"
const isLoading = ref(true);
const error = ref(null);

const pathIdentifier = computed(() => route.params.pathId); // This is usually employeeId for this view

const fetchPath = async () => {
  isLoading.value = true;
  error.value = null;
  try {

    const response = await learningPathService.getLearningPathForEmployee(pathIdentifier.value);
    learningPath.value = response.data;
    employeeName.value = response.data?.employee?.name || '';
  } catch (err) {
    error.value = err.response?.data?.message || "Could not load the learning path.";
    learningPath.value = null;
  } finally {
    isLoading.value = false;
  }
};

const allStepsCompleted = computed(() => {
    return learningPath.value && learningPath.value.path_data && learningPath.value.path_data.every(step => step.completed);
});

onMounted(() => {
  if (pathIdentifier.value) fetchPath();
  else {
    error.value = "No path identifier provided.";
    isLoading.value = false;
  }
});

watch(pathIdentifier, (newId) => {
    if (newId) fetchPath();
});

const handleStepToggle = async (stepIndex, completedStatus) => {
    if (!learningPath.value || !learningPath.value.id || !learningPath.value.path_data[stepIndex]) return;
    
    const originalStatus = learningPath.value.path_data[stepIndex].completed;
    learningPath.value.path_data[stepIndex].completed = completedStatus;

    try {
        // API call to update status in the backend
        const updatedPathResponse = await learningPathService.updateStepStatus(
            learningPath.value.id, 
            stepIndex, 
            completedStatus
        );
        learningPath.value = updatedPathResponse.data; 
        employeeName.value = updatedPathResponse.data?.employee?.name || employeeName.value;
    } catch (err) {
        console.error("Error updating step status for learner:", err);
        alert("Failed to update progress. Please try again.");
        learningPath.value.path_data[stepIndex].completed = originalStatus;
    }
};
</script>