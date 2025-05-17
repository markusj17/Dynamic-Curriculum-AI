<template>
  <div class="container mx-auto p-4">
    <div v-if="isLoading" class="text-center py-10">
      <p class="text-gray-600">Loading your learning path...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border-red-400 text-red-700 px-4 py-3 rounded">
      <p>Error loading learning path: {{ error }}</p>
      <p>Please contact your L&D manager or try again later.</p>
    </div>
    <div v-else-if="learningPath && learningPath.path_data && learningPath.status === 'assigned' || learningPath.status === 'in_progress'">
      <PathDisplay
        :path-steps="learningPath.path_data"
        :path-title="`Your Learning Path: ${employeeName}`"
        :is-learner-view="true"
        @step-completion-toggled="handleStepToggle"
      />
    </div>
    <div v-else-if="learningPath && learningPath.status === 'draft'">
         <div class="card text-center py-10">
            <h2 class="text-2xl font-semibold text-gray-700 mb-3">Path Not Yet Assigned</h2>
            <p class="text-gray-600">Your learning path is still being prepared by your L&D manager.</p>
            <p class="text-gray-600">Please check back later.</p>
        </div>
    </div>
     <div v-else-if="learningPath && learningPath.status === 'completed'">
         <div class="card text-center py-10">
            <h2 class="text-2xl font-semibold text-green-600 mb-3">🎉 Congratulations! 🎉</h2>
            <p class="text-gray-700">You have completed your learning path for {{ employeeName }}.</p>
            <p class="text-gray-600">Great job!</p>
        </div>
    </div>
    <div v-else class="card text-center py-10">
      <h2 class="text-2xl font-semibold text-gray-700 mb-3">No Learning Path Found</h2>
      <p class="text-gray-600">A learning path has not been assigned to you yet, or it may not exist.</p>
      <p class="text-gray-600">Please contact your L&D manager.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useEmployeeStore } from '../stores/employeeStore';
import learningPathService from '../services/learningPathService'; 
import PathDisplay from '../components/learning-paths/PathDisplay.vue';
import { useAuthStore } from '../stores/authStore';


const route = useRoute();
const employeeStore = useEmployeeStore(); 
const authStore = useAuthStore();

const learningPath = ref(null);
const employeeName = ref(''); 
const isLoading = ref(true);
const error = ref(null);



const pathIdentifier = computed(() => route.params.pathId);

const fetchPath = async () => {
  isLoading.value = true;
  error.value = null;
  try {

    const response = await learningPathService.getLearningPathForEmployee(pathIdentifier.value); 
    learningPath.value = response.data;

    if (authStore.isLdManager && employeeStore.currentEmployee && employeeStore.currentEmployee.id == pathIdentifier.value) {
        employeeName.value = employeeStore.currentEmployee.name;
    } else {

        employeeName.value = learningPath.value?.employee?.name || "this path"; 
    }

  } catch (err) {
    console.error("Error fetching learning path for learner:", err);
    error.value = err.response?.data?.message || "Could not load the learning path.";
    learningPath.value = null;
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  if (pathIdentifier.value) {
    fetchPath();
  } else {
    error.value = "No path identifier provided.";
    isLoading.value = false;
  }
});

const handleStepToggle = async (stepIndex, completed) => {
    if (!learningPath.value || !learningPath.value.id) return;
    isLoading.value = true;
    try {
        const updatedPath = await learningPathService.updateStepStatus(learningPath.value.id, stepIndex, completed);
        learningPath.value = updatedPath.data; 
    } catch (err) {
        console.error("Error updating step status for learner:", err);
        alert("Failed to update progress. Please try again.");
        await fetchPath(); 
    } finally {
        isLoading.value = false;
    }
};
</script>