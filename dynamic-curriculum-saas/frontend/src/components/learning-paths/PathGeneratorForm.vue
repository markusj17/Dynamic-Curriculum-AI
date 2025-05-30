<template>
  <div class="space-y-6">
    <!-- Header and Generate Button -->
    <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4">
      <div>
        <p v-if="employee && employee.learningPath" class="text-xs text-slate-400">
          Current Path Status: 
          <span class="font-medium capitalize px-2 py-0.5 rounded-full" :class="pathStatusColor(employee.learningPath.status)">
            {{ employee.learningPath.status || 'N/A' }}
          </span>
        </p>
         <p v-else class="text-xs text-slate-400">No learning path exists for this employee yet.</p>
      </div>
      <button
        @click="generatePath"
        :disabled="isGenerationDisabled"
        class="btn-intellipath-primary w-full sm:w-auto !py-2.5 !px-5 text-sm group"
        title="Generates a new path. Existing unsaved changes to the current path will be lost."
      >
        <svg v-if="!(employeeStore.isLoading && generatingPath)" class="w-5 h-5 mr-2 transition-transform duration-300 group-hover:rotate-[20deg]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 16v-2m0-8a4 4 0 00-4 4h8a4 4 0 00-4-4z"></path></svg>
        <span v-if="employeeStore.isLoading && generatingPath" class="animate-subtle-pulse">Generating...</span>
        <span v-else>{{ (employee && employee.learningPath && localPathData.length > 0) ? 'Regenerate Path with AI' : 'Generate Path with AI' }}</span>
      </button>
    </div>

    <div v-if="showPrerequisitesWarning" class="bg-yellow-800/30 border border-yellow-700 text-yellow-300 px-4 py-3 rounded-lg text-sm">
      <p>
        Please ensure the employee's "Current Skills" and "Desired Skills/Goal" are defined in their profile before generating a learning path.
      </p>
    </div>

    <!-- Path Generation Error Display -->
    <div v-if="pathGenerationError" class="bg-red-800/30 border border-red-700 text-red-300 px-4 py-3 rounded-lg text-sm space-y-2">
      <p class="font-semibold">Error Generating Learning Path:</p>
      <p>{{ pathGenerationError }}</p>
      <details v-if="rawErrorFromAI" class="text-xs cursor-pointer">
        <summary class="outline-none focus:ring-1 focus:ring-red-400 rounded">Show raw AI output/error</summary>
        <pre class="mt-2 bg-slate-700 p-2 rounded overflow-x-auto whitespace-pre-wrap">{{ rawErrorFromAI }}</pre>
      </details>
    </div>

    <div v-if="localPathData && localPathData.length > 0" class="space-y-4 mt-6">
      <h4 class="text-md font-semibold text-slate-100">Generated Path Steps (Editable by L&D Manager):</h4>
      <div v-for="(step, index) in localPathData" :key="step.frontend_id" class="card-intellipath p-4 md:p-5">
        <PathStep
          :step-data="step"
          :index="index"
          :is-editable="true" 
          @update:step="updateStepLocally"
          @toggle-complete="handleToggleStepComplete"
        />
      </div>
      <div class="mt-8 flex flex-col sm:flex-row justify-end gap-3 border-t border-slate-700 pt-6">
        <button @click="saveCuratedPath('draft')" class="btn-intellipath-secondary" :disabled="employeeStore.isLoading && savingPath">
            <span v-if="employeeStore.isLoading && savingPath && currentSaveAction === 'draft'" class="animate-subtle-pulse">Saving Draft...</span>
            <span v-else>Save as Draft</span>
        </button>
        <button @click="saveCuratedPath('assigned')" class="btn-intellipath-primary" :disabled="employeeStore.isLoading && savingPath">
            <span v-if="employeeStore.isLoading && savingPath && currentSaveAction === 'assigned'" class="animate-subtle-pulse">Saving & Assigning...</span>
            <span v-else>Save and Assign Path</span>
        </button>
      </div>
    </div>
    <div v-else-if="employeeStore.isLoading && generatingPath" class="card-intellipath p-8 text-center text-slate-400">
        <p class="animate-pulse text-lg">Crafting personalized learning journey...</p>
        <p class="text-sm mt-2">This may take a moment.</p>
    </div>
    <div v-else-if="!pathGenerationError && employee && !employee.learningPath" class="card-intellipath p-6 text-center text-slate-400">
        <p>No learning path has been generated for this employee yet.</p>
        <p class="mt-1 text-sm">Click "Generate Path with AI" to create one.</p>
    </div>
     <div v-else-if="!pathGenerationError && employee && employee.learningPath && (!employee.learningPath.path_data || employee.learningPath.path_data.length === 0)" class="card-intellipath p-6 text-center text-slate-400">
        <p>The current learning path is empty or has no steps defined.</p>
        <p class="mt-1 text-sm">You can "Regenerate Path with AI".</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useEmployeeStore } from '../../stores/employeeStore';
import PathStep from './PathStep.vue';
const props = defineProps({
  employee: Object,
});

const employeeStore = useEmployeeStore();
const localPathData = ref([]); 
const generatingPath = ref(false);
const savingPath = ref(false);
const currentSaveAction = ref('');
const pathGenerationError = ref(null);
const rawErrorFromAI = ref(null);

const normalizeStepData = (step, index) => {
  const details = step.details || {};
  return {
    frontend_id: step.id || `step-temp-${Date.now()}-${index}`,
    id: step.id, 
    title: step.title || '', 
    step_type: step.step_type || 'lesson', 
    details: {
      markdown_content: details.markdown_content || '',
      external_url: details.external_url || '',
      resource_summary: details.resource_summary || '',
      video_url: details.video_url || '',
      video_summary: details.video_summary || '',
      quiz_questions: details.quiz_questions || [],
      challenge_description: details.challenge_description || '',
    },
    estimated_duration_minutes: step.estimated_duration_minutes || null,
    completed: typeof step.completed === 'boolean' ? step.completed : false,
  };
};

watch(() => props.employee, (newEmployee) => {
  console.log("[PathGeneratorForm] Watcher: props.employee changed.", newEmployee);
  pathGenerationError.value = null;
  rawErrorFromAI.value = null;

  if (newEmployee && newEmployee.learningPath && Array.isArray(newEmployee.learningPath.path_data)) {
    console.log("[PathGeneratorForm] Watcher: Processing new path_data from props:", newEmployee.learningPath.path_data);
    localPathData.value = JSON.parse(JSON.stringify(newEmployee.learningPath.path_data)).map(normalizeStepData);
  } else {
    localPathData.value = [];
    console.log("[PathGeneratorForm] Watcher: No valid path_data in props, localPathData cleared.");
  }
  console.log("[PathGeneratorForm] Watcher: localPathData is now (first step):", JSON.stringify(localPathData.value[0], null, 2));
}, { immediate: true, deep: true });

const showPrerequisitesWarning = computed(() => {
    return !(props.employee && props.employee.current_skills && props.employee.desired_skills_goal);
});

const isGenerationDisabled = computed(() => {
    return (employeeStore.isLoading && generatingPath.value) || showPrerequisitesWarning.value;
});

const generatePath = async () => {
  if (!props.employee || !props.employee.id) {
      pathGenerationError.value = "No employee selected or employee ID is missing.";
      return;
  }
  if (showPrerequisitesWarning.value) {
      console.warn("Prerequisites for path generation not met.");
      return;
  }

  if (localPathData.value.length > 0) {
    if (!window.confirm("This will discard any unsaved changes to the current path and generate a new one. Continue?")) {
      return;
    }
  }

  generatingPath.value = true;
  pathGenerationError.value = null;
  rawErrorFromAI.value = null;
  localPathData.value = [];

  try {
    const resultFromStore = await employeeStore.generateLearningPathForEmployee(props.employee.id);

    console.log("[PathGeneratorForm] Result from generateLearningPathForEmployee store action:", resultFromStore);


    if (resultFromStore && resultFromStore.error) {
        pathGenerationError.value = resultFromStore.error;
        rawErrorFromAI.value = resultFromStore.raw || null;
    } else if (resultFromStore && Array.isArray(resultFromStore.path_data)) {
        localPathData.value = JSON.parse(JSON.stringify(resultFromStore.path_data)).map(normalizeStepData);
        console.log("[PathGeneratorForm] Path generated and localPathData updated directly from store result.");
    } else if (Array.isArray(resultFromStore)) { 
        localPathData.value = JSON.parse(JSON.stringify(resultFromStore)).map(normalizeStepData);
        console.log("[PathGeneratorForm] Path generated and localPathData updated directly from store result (array).");
    }
    
  } catch (error) {
    console.error("[PathGeneratorForm] Critical error during path generation call:", error);
    pathGenerationError.value = error.message || 'An unexpected critical error occurred during path generation.';
    rawErrorFromAI.value = error.aiRawResponse || error.raw || error.details || error.toString();
  } finally {
    generatingPath.value = false;
  }
};

const updateStepLocally = (updatedStep, index) => {
  if (localPathData.value && typeof localPathData.value[index] !== 'undefined') {
    console.log(`[PathGeneratorForm] Updating step at index ${index} locally with:`, JSON.stringify(updatedStep, null, 2));
    localPathData.value[index] = { ...localPathData.value[index], ...updatedStep };
  } else {
    console.warn(`[PathGeneratorForm] Attempted to update step at invalid index ${index}. Current localPathData:`, localPathData.value);
  }
};

const handleToggleStepComplete = (index, completedStatus) => {
    if (localPathData.value && localPathData.value[index]) {
        localPathData.value[index].completed = completedStatus;
        console.log(`[PathGeneratorForm] Toggled step ${index} completion to: ${completedStatus}`);
    }
};

const saveCuratedPath = async (status) => {
  if (!props.employee || !props.employee.learningPath || !props.employee.learningPath.id) {
      alert("No learning path ID found. Generate or load a path first.");
      return;
  }
  if (!localPathData.value) { 
      alert("Path data is missing. Cannot save.");
      return;
  }
  if (localPathData.value.length === 0) {
      if (!window.confirm("The learning path is currently empty. Do you want to save an empty path?")) {
          return;
      }
  }

  savingPath.value = true;
  currentSaveAction.value = status;
  pathGenerationError.value = null;
  rawErrorFromAI.value = null;

  try {
    const pathDataToSave = localPathData.value.map(step => {

      return {
        id: step.id && !step.id.startsWith('step-temp-') ? step.id : undefined,
        title: step.title,
        step_type: step.step_type,
        details: step.details,
        estimated_duration_minutes: step.estimated_duration_minutes,
        completed: step.completed,
      };
    });

    console.log("[PathGeneratorForm] SAVING CURATED PATH to backend (first step being sent):", JSON.stringify(pathDataToSave[0], null, 2));

    await employeeStore.curatePath(props.employee.learningPath.id, {
      path_data: pathDataToSave, // This is the array of step objects
      status: status,
    });
    alert(`Path successfully ${status === 'assigned' ? 'assigned to employee' : 'saved as draft'}!`);

    await employeeStore.fetchEmployeeById(props.employee.id);

  } catch (error) {
    console.error("[PathGeneratorForm] Error saving curated path:", error);
    pathGenerationError.value = error.message || `Failed to ${status === 'assigned' ? 'assign' : 'save draft'}.`;
  } finally {
    savingPath.value = false;
    currentSaveAction.value = '';
  }
};

const pathStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-600';
    case 'assigned': return 'bg-blue-500/20 text-blue-300 border border-blue-600';
    case 'in_progress': return 'bg-sky-500/20 text-sky-300 border border-sky-600';
    case 'completed': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-600';
    default: return 'bg-slate-700/50 text-slate-400 border border-slate-600';
  }
};
</script>