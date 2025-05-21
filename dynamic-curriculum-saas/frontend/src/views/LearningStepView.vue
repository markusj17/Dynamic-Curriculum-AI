<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 flex flex-col items-center py-8 px-4 sm:px-6 lg:px-8">
    <div class="w-full max-w-3xl space-y-6">
      <!-- Back to Path Overview Link -->
      <div class="mb-6">
        <router-link 
          :to="`/mylearning/${employeeId}`" 
          class="inline-flex items-center text-sky-400 hover:text-sky-300 transition-colors group text-sm"
        >
          <svg class="w-5 h-5 mr-2 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          Back to Learning Path Overview
        </router-link>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="card-intellipath p-10 text-center">
        <div class="flex justify-center items-center space-x-3">
          <svg class="animate-spin h-8 w-8 text-sky-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p class="text-slate-300 text-lg">Loading step content...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="card-intellipath bg-red-800/30 border-red-700 p-6 text-red-300">
        <h2 class="text-xl font-semibold mb-2 text-red-400">Error Loading Step</h2>
        <p>{{ error }}</p>
      </div>
      
      <!-- Step Content Display -->
      <div v-else-if="currentStep" class="card-intellipath p-6 md:p-8 space-y-6">
        <div class="border-b border-slate-700 pb-4 mb-6">
          <p class="text-xs text-sky-400 uppercase tracking-wider">{{ currentStep.step_type }}</p>
          <h1 class="text-3xl font-bold text-slate-100 mt-1">{{ currentStep.title }}</h1>
          <p v-if="currentStep.estimated_duration_minutes" class="text-sm text-slate-400 mt-1">
            Estimated duration: {{ currentStep.estimated_duration_minutes }} minutes
          </p>
        </div>

        <!-- Lesson Content -->
        <div v-if="currentStep.step_type === 'lesson' && currentStep.details?.markdown_content" 
             class="prose prose-invert prose-sm sm:prose-base max-w-none" 
             v-html="renderMarkdown(currentStep.details.markdown_content)">
        </div>
        <div v-else-if="currentStep.step_type === 'lesson'">
            <p class="text-slate-400">No lesson content available for this step.</p>
        </div>

        <!-- External Resource Content -->
        <div v-if="currentStep.step_type === 'external_resource' && currentStep.details?.external_url" class="space-y-3">
          <p class="text-slate-300">{{ currentStep.details.resource_summary || 'Please review the following external resource.' }}</p>
          <a :href="currentStep.details.external_url" target="_blank" rel="noopener noreferrer" 
             class="btn-intellipath-secondary inline-flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            Open Resource
          </a>
        </div>
        <div v-else-if="currentStep.step_type === 'external_resource'">
            <p class="text-slate-400">Resource link is missing for this step.</p>
        </div>
        
        <!-- Video Content -->
        <div v-if="currentStep.step_type === 'video' && currentStep.details?.video_url" class="space-y-3">
            <p class="text-slate-300">{{ currentStep.details.video_summary || 'Please watch the following video.' }}</p>
            <div class="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden border border-slate-700">
                <!-- Basic iframe embed, consider a Vue YouTube/Vimeo component for more control -->
                <iframe :src="getEmbedUrl(currentStep.details.video_url)" 
                        frameborder="0" 
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                        allowfullscreen
                        class="w-full h-full">
                </iframe>
            </div>
        </div>
         <div v-else-if="currentStep.step_type === 'video'">
            <p class="text-slate-400">Video link is missing for this step.</p>
        </div>

        <!-- Placeholder for Quiz -->
        <div v-if="currentStep.step_type === 'quiz'" class="text-center py-8 text-slate-400">
          <p class="text-lg font-semibold text-sky-400">Quiz Coming Soon!</p>
          <p class="text-sm">Interactive quiz functionality will be implemented here.</p>
          <!-- For now, allow marking as complete -->
           <button @click="markStepComplete(true)" 
                  v-if="!currentStepProgress || !currentStepProgress.completed"
                  class="btn-intellipath-primary mt-6">
            Mark as Complete (Placeholder)
          </button>
        </div>

        <!-- Placeholder for Challenge -->
        <div v-if="currentStep.step_type === 'challenge'" class="text-center py-8 text-slate-400">
          <p class="text-lg font-semibold text-sky-400">Challenge Coming Soon!</p>
          <p class="text-sm">Interactive challenge content will be implemented here.</p>
           <button @click="markStepComplete(true)" 
                  v-if="!currentStepProgress || !currentStepProgress.completed"
                  class="btn-intellipath-primary mt-6">
            Mark as Complete (Placeholder)
          </button>
        </div>

        <!-- Completion Button (for lesson, external_resource, video for now) -->
        <div v-if="['lesson', 'external_resource', 'video'].includes(currentStep.step_type)" class="pt-6 border-t border-slate-700 mt-8">
          <button @click="markStepComplete(!isStepCompleted)" 
                  :class="isStepCompleted ? 'btn-intellipath-secondary' : 'btn-intellipath-primary'"
                  class="w-full sm:w-auto flex items-center justify-center"
                  :disabled="isUpdatingProgress">
            <svg v-if="isStepCompleted" class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path></svg>
            <svg v-else class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span v-if="isUpdatingProgress" class="animate-subtle-pulse">Updating...</span>
            <span v-else>{{ isStepCompleted ? 'Mark as Incomplete' : 'Mark as Complete' }}</span>
          </button>
        </div>
        
        <!-- Navigation -->
        <div class="flex justify-between items-center pt-6 mt-8">
          <router-link v-if="previousStepId" :to="`/mylearning/${employeeId}/step/${previousStepId}`" class="btn-intellipath-secondary !py-2 !px-4 text-sm inline-flex items-center">
            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16l-4-4m0 0l4-4m-4 4h18"></path></svg>
            Previous
          </router-link>
          <div v-else></div> <!-- Placeholder to keep "Next" on the right -->

          <router-link v-if="nextStepId" :to="`/mylearning/${employeeId}/step/${nextStepId}`" class="btn-intellipath-primary !py-2 !px-4 text-sm inline-flex items-center">
            Next
            <svg class="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
          </router-link>
          <router-link v-else :to="`/mylearning/${employeeId}`" class="btn-intellipath-primary !py-2 !px-4 text-sm">
            Back to Path Overview
          </router-link>
        </div>

      </div>
      <div v-else class="card-intellipath p-10 text-center text-slate-400">
        <p>Step content not found or path is misconfigured.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { marked } from 'marked'; // For rendering Markdown
// Placeholder imports - ensure paths are correct
import learningPathService from '../services/learningPathService'; 
import { useEmployeeStore } from '../stores/employeeStore'; // If needed for global path state or user info
import logoUrl from '../assets/intellipath-logo.png';

const props = defineProps({
  employeeId: { type: [String, Number], required: true },
  stepId: { type: [String, Number], required: true },
});

const route = useRoute();
const router = useRouter();
const employeeStore = useEmployeeStore(); 

const fullLearningPath = ref(null); 
const currentStep = ref(null);
const currentStepProgress = ref(null);
const isLoading = ref(true);
const error = ref(null);
const isUpdatingProgress = ref(false);

const getEmbedUrl = (url) => {
  if (!url) return '';
  try {
    const videoUrl = new URL(url);
    if (videoUrl.hostname.includes('youtube.com') || videoUrl.hostname.includes('youtu.be')) {
      const videoId = videoUrl.hostname.includes('youtu.be') 
                      ? videoUrl.pathname.substring(1) 
                      : videoUrl.searchParams.get('v');
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url;
    }
    if (videoUrl.hostname.includes('vimeo.com')) {
      const videoId = videoUrl.pathname.split('/').pop();
      return videoId ? `https://player.vimeo.com/video/${videoId}` : url;
    }
  } catch (e) { console.error("Error parsing video URL:", e); }
  return url; // Fallback if not YouTube/Vimeo or parsing fails
};

const renderMarkdown = (markdownText) => {
  if (!markdownText) return '';
  return marked.parse(markdownText, { breaks: true, gfm: true }); // Basic marked options
};

const fetchStepData = async () => {
  isLoading.value = true;
  error.value = null;
  try {
    // Option 1: Fetch the entire learning path and then find the current step.
    // This is useful for next/previous navigation.
    // Backend should ideally return steps sorted by `step_order`.
    const pathResponse = await learningPathService.getLearningPathForEmployee(props.employeeId);
    if (pathResponse.data && pathResponse.data.path_data && Array.isArray(pathResponse.data.path_data)) {
      fullLearningPath.value = pathResponse.data; // Store the whole path object
      
      const stepIdToFind = parseInt(props.stepId, 10);
      currentStep.value = fullLearningPath.value.path_data.find(s => s.id === stepIdToFind || s.id === props.stepId);

      if (currentStep.value) {
        // TODO: Fetch UserStepProgress for this specific step
        // currentStepProgress.value = await learningPathService.getStepProgress(props.employeeId, currentStep.value.id);
        // For now, let's assume 'completed' is part of currentStep.value if path_data was enriched
        // Or, if stepData already has 'completed' from the parent path object:
        if (typeof currentStep.value.completed === 'undefined') {
            currentStep.value.completed = false; // Default if not present
        }
      } else {
        error.value = `Step with ID ${props.stepId} not found in the learning path for employee ${props.employeeId}.`;
      }
    } else {
      error.value = "Learning path data is invalid or missing.";
    }
  } catch (err) {
    console.error("Error fetching step data:", err);
    error.value = err.response?.data?.message || "Could not load step content.";
  } finally {
    isLoading.value = false;
  }
};

const currentStepIndex = computed(() => {
  if (!fullLearningPath.value || !fullLearningPath.value.path_data || !currentStep.value) return -1;
  const currentStepId = currentStep.value.id;
  return fullLearningPath.value.path_data.findIndex(s => s.id == currentStepId);
});

const previousStepId = computed(() => {
  if (!fullLearningPath.value || !fullLearningPath.value.path_data || currentStepIndex.value <= 0) return null;
  return fullLearningPath.value.path_data[currentStepIndex.value - 1]?.id;
});

const nextStepId = computed(() => {
  if (!fullLearningPath.value || !fullLearningPath.value.path_data || currentStepIndex.value === -1 || currentStepIndex.value >= fullLearningPath.value.path_data.length - 1) return null;
  return fullLearningPath.value.path_data[currentStepIndex.value + 1]?.id;
});

const isStepCompleted = computed(() => {
    return currentStep.value?.completed || currentStepProgress.value?.completed || false;
});

const markStepComplete = async (newCompletedStatus) => {
  if (!currentStep.value || !fullLearningPath.value) return;
  isUpdatingProgress.value = true;
  try {
    await learningPathService.updateStepStatus(
        fullLearningPath.value.id,
        currentStepIndex.value,   
        newCompletedStatus
    );
    currentStep.value.completed = newCompletedStatus; // Update local state
    if (fullLearningPath.value.path_data[currentStepIndex.value]) {
        fullLearningPath.value.path_data[currentStepIndex.value].completed = newCompletedStatus;
    }
  } catch (err) {
    console.error("Error marking step complete:", err);
    alert("Failed to update progress. Please try again.");
  } finally {
    isUpdatingProgress.value = false;
  }
};

onMounted(() => {
  fetchStepData();
});

watch(() => [props.employeeId, props.stepId], ([newEmpId, newStepId], [oldEmpId, oldStepId]) => {
  if (newEmpId !== oldEmpId || newStepId !== oldStepId) {
    fetchStepData();
  }
});

</script>

<style>
.prose-invert {
  --tw-prose-body: theme('colors.slate.300');
  --tw-prose-headings: theme('colors.slate.100');
  --tw-prose-lead: theme('colors.slate.400');
  --tw-prose-links: theme('colors.sky.400');
  --tw-prose-bold: theme('colors.slate.100');
  --tw-prose-counters: theme('colors.slate.400');
  --tw-prose-bullets: theme('colors.slate.600');
  --tw-prose-hr: theme('colors.slate.700');
  --tw-prose-quotes: theme('colors.slate.100');
  --tw-prose-quote-borders: theme('colors.slate.700');
  --tw-prose-captions: theme('colors.slate.400');
  --tw-prose-code: theme('colors.sky.300');
  --tw-prose-pre-code: theme('colors.slate.300');
  --tw-prose-pre-bg: theme('colors.slate.800'); 
  --tw-prose-th-borders: theme('colors.slate.600');
  --tw-prose-td-borders: theme('colors.slate.700');
}
.prose-invert code::before, .prose-invert code::after {
    content: "";
}
</style>