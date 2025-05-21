<template>
  <div class="space-y-3">
    <div class="flex justify-between items-start gap-4">
      <h4 class="text-lg font-semibold flex-grow" 
          :class="localStepData.completed ? 'text-emerald-400 line-through decoration-emerald-500 decoration-2' : 'text-sky-300'">
        <span class="text-slate-500 mr-1.5">{{ index + 1 }}.</span>
        {{ localStepData.title || localStepData.topic }} {/* Handle old 'topic' field */}
      </h4>
      <div class="flex-shrink-0 pt-1">
          <label :for="uniqueId" class="flex items-center space-x-2 cursor-pointer group" 
                 title="Mark step as completed/incomplete">
            <input
                type="checkbox"
                :id="uniqueId"
                :checked="localStepData.completed"
                @change="toggleCompletion"
                :disabled="isUpdating"
                class="form-checkbox h-5 w-5 text-sky-500 bg-slate-700 border-slate-600 rounded 
                       focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800 
                       transition duration-150 ease-in-out disabled:opacity-50"
            />
            <span class="text-sm font-medium text-slate-300 group-hover:text-sky-300 transition-colors">
              <span v-if="isUpdating" class="animate-pulse">Saving...</span>
              <span v-else>{{ localStepData.completed ? 'Completed' : 'Mark Done' }}</span>
            </span>
        </label>
      </div>
    </div>
    <p class="text-sm text-slate-300/90 leading-relaxed pl-6">
      {{ localStepData.description || localStepData.details?.markdown_content || localStepData.details?.resource_summary || localStepData.details?.video_summary || localStepData.details?.challenge_description }}
    </p>
    <div class="pl-6 pt-1">
      <a v-if="resourceLink" 
         :href="resourceLink" 
         target="_blank" rel="noopener noreferrer"
         class="text-cyan-400 hover:text-cyan-300 hover:underline text-sm break-all transition-colors inline-flex items-center group py-1">
        <svg class="w-4 h-4 mr-1.5 text-cyan-500 group-hover:text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        View Resource Material
        <svg class="w-3.5 h-3.5 ml-1.5 opacity-60 group-hover:opacity-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
      </a>
      <p v-else class="text-sm text-slate-500 py-1 pl-1">No external resource link provided for this step.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import learningPathService from '../../services/learningPathService';

const props = defineProps({
  stepData: { type: Object, required: true },
  index: { type: Number, required: true },
  employeeId: { type: [String, Number], required: true },
  learningPathId: {type: [String, Number], required: true}, 
});

const emit = defineEmits(['step-completion-updated']);

const localStepData = ref({ ...props.stepData });
const isUpdating = ref(false);
const uniqueId = computed(() => `learner-chk-${props.index}-${localStepData.value.id || Math.random()}`);

watch(() => props.stepData, (newVal) => {
    localStepData.value = { ...newVal };
}, { deep: true });

const resourceLink = computed(() => {
    return localStepData.value.suggested_link || localStepData.value.details?.external_url || localStepData.value.details?.video_url;
});

const toggleCompletion = async (event) => {
  const newCompletedStatus = event.target.checked;
  isUpdating.value = true;
  try {
    const response = await learningPathService.updateStepStatus(
      props.learningPathId, 
      props.index,         
      newCompletedStatus
    );
    localStepData.value.completed = newCompletedStatus; 
    emit('step-completion-updated', response.data.path_data[props.index] || localStepData.value); // Send updated step
  } catch (error) {
    console.error("Failed to update step completion status:", error);
    alert("Error updating status. Please try again.");
    event.target.checked = !newCompletedStatus; 
    localStepData.value.completed = !newCompletedStatus;
  } finally {
    isUpdating.value = false;
  }
};
</script>