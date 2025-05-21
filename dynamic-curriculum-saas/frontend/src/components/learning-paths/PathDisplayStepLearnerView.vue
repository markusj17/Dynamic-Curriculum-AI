<template>
  <div class="space-y-3">
    <div class="flex justify-between items-start gap-4">
      <h4 class="text-md font-semibold" :class="stepData.completed ? 'text-emerald-400 line-through' : 'text-sky-300'">
        {{ index + 1 }}. {{ stepData.topic }}
      </h4>
      <div class="flex-shrink-0 pt-0.5">
          <label :for="'completed-' + uniqueId" class="flex items-center space-x-2 cursor-pointer group" 
                 title="Mark step as completed">
            <input
                type="checkbox"
                :id="'completed-' + uniqueId"
                :checked="stepData.completed"
                @change="toggle"
                class="form-checkbox h-5 w-5 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            />
            <span class="text-sm font-medium text-slate-300 group-hover:text-sky-400 transition-colors">Done</span>
        </label>
      </div>
    </div>
    <p class="text-sm text-slate-300/90 leading-relaxed">{{ stepData.description }}</p>
    <div>
      <a v-if="stepData.suggested_link" :href="stepData.suggested_link" target="_blank" rel="noopener noreferrer"
         class="text-cyan-400 hover:text-cyan-300 hover:underline text-sm break-all transition-colors inline-flex items-center group py-1">
        <span class="truncate">View Resource</span>
        <svg class="w-3.5 h-3.5 ml-1.5 opacity-70 group-hover:opacity-100 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
      </a>
      <p v-else class="text-sm text-slate-500 py-1">No external link provided for this step.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  stepData: { type: Object, required: true },
  index: { type: Number, required: true },
});

const emit = defineEmits(['toggle-complete']);

const uniqueId = computed(() => `learner-step-${props.index}-${Date.now().toString(36)}`);

const toggle = (event) => {
  emit('toggle-complete', props.index, event.target.checked);
};
</script>