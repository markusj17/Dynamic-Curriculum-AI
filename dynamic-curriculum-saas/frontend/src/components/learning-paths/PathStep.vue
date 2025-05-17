<template>
  <div class="space-y-4">
    <div class="flex justify-between items-start gap-4">
      <div class="flex-grow">
        <label :for="'topic-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">
          {{ index + 1 }}. Step Topic
        </label>
        <input
          v-if="isEditable"
          :id="'topic-' + uniqueId"
          type="text"
          v-model="editableStep.topic"
          @input="emitUpdate"
          class="input-field-intellipath !py-2 text-md font-semibold"
          placeholder="Learning Topic Title"
        />
        <h4 v-else class="text-md font-semibold text-sky-300 py-2">
          {{ index + 1 }}. {{ editableStep.topic }}
        </h4>
      </div>
      <div v-if="isEditable || isLearnerView" class="flex-shrink-0 pt-6"> 
        <label :for="'completed-' + uniqueId" class="flex items-center space-x-2 cursor-pointer group" 
               title="Mark step as completed">
          <input
            type="checkbox"
            :id="'completed-' + uniqueId"
            :checked="editableStep.completed"
            @change="toggleCompletion"
            class="form-checkbox h-5 w-5 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
          />
          <span class="text-sm font-medium text-slate-300 group-hover:text-sky-400 transition-colors">
            {{ isEditable && !isLearnerView ? 'Done (Admin)' : 'Done' }}
          </span>
        </label>
      </div>
    </div>

    <div>
      <label :for="'description-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Description</label>
      <textarea
        v-if="isEditable"
        :id="'description-' + uniqueId"
        v-model="editableStep.description"
        @input="emitUpdate"
        rows="3"
        class="input-field-intellipath !py-2 text-sm"
        placeholder="Describe what this learning step covers..."
      ></textarea>
      <p v-else class="text-sm text-slate-300 mt-1 py-2 min-h-[4em] whitespace-pre-wrap">{{ editableStep.description }}</p>
    </div>

    <div>
      <label :for="'link-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Resource Link</label>
      <input
        v-if="isEditable"
        :id="'link-' + uniqueId"
        type="url"
        v-model="editableStep.suggested_link"
        @input="emitUpdate"
        class="input-field-intellipath !py-2 text-sm"
        placeholder="https://example.com/resource-material"
      />
      <a v-else :href="editableStep.suggested_link" target="_blank" rel="noopener noreferrer"
         class="text-cyan-400 hover:text-cyan-300 hover:underline text-sm break-all transition-colors inline-flex items-center group py-2">
        <span class="truncate">{{ editableStep.suggested_link || 'No link provided' }}</span>
        <svg v-if="editableStep.suggested_link" class="w-3.5 h-3.5 ml-1.5 opacity-70 group-hover:opacity-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue';

const props = defineProps({
  stepData: { type: Object, required: true },
  index: { type: Number, required: true },
  isEditable: { type: Boolean, default: false },
  isLearnerView: { type: Boolean, default: false },
});

const emit = defineEmits(['update:step', 'toggle-complete']);

const editableStep = ref({ topic: '', description: '', suggested_link: '', completed: false });

const uniqueId = computed(() => `step-${props.index}-${Date.now()}`); 

watch(() => props.stepData, (newVal) => {
  if (newVal) {
    editableStep.value = { ...newVal }; 
    if (typeof editableStep.value.completed === 'undefined') {
        editableStep.value.completed = false; 
    }
  }
}, { deep: true, immediate: true });

const emitUpdate = () => {
  if (props.isEditable) {
    emit('update:step', { ...editableStep.value }, props.index);
  }
};

const toggleCompletion = (event) => {
    const newCompletedStatus = event.target.checked;
    editableStep.value.completed = newCompletedStatus; 
    emit('toggle-complete', props.index, newCompletedStatus); 
};
</script>