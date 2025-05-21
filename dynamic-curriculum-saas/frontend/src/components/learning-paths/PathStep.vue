<template>
  <div class="space-y-4">
    <div class="flex justify-between items-start gap-4">
      <div class="flex-grow">
        <label :for="'title-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">
          {{ index + 1 }}. Step Title
        </label>
        <input
          v-if="isEditable"
          :id="'title-' + uniqueId"
          type="text"
          v-model="editableStep.title"
          @input="emitUpdate"
          class="input-field-intellipath !py-2 text-md font-semibold"
          placeholder="Learning Step Title"
        />
        <h4 v-else class="text-md font-semibold text-sky-300 py-2">
          {{ index + 1 }}. {{ editableStep.title }}
        </h4>
      </div>
      <div v-if="isEditable" class="flex-shrink-0 pt-6">
         <label :for="'completed-' + uniqueId" class="flex items-center space-x-2 cursor-pointer group" 
               title="Mark step as completed/incomplete by admin">
            <input
                type="checkbox"
                :id="'completed-' + uniqueId"
                :checked="editableStep.completed"
                @change="toggleAdminCompletion"
                class="form-checkbox h-5 w-5 text-sky-500 bg-slate-700 border-slate-600 rounded focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-slate-800"
            />
            <span class="text-sm font-medium text-slate-300 group-hover:text-sky-400 transition-colors">Done (Admin)</span>
        </label>
      </div>
    </div>

    <div v-if="isEditable">
        <label :for="'step-type-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Step Type</label>
        <select :id="'step-type-' + uniqueId" v-model="editableStep.step_type" @change="emitUpdate" class="input-field-intellipath !py-2 text-sm">
            <option value="lesson">Lesson</option>
            <option value="quiz">Quiz</option>
            <option value="challenge">Challenge</option>
            <option value="external_resource">External Resource</option>
            <option value="video">Video</option>
        </select>
    </div>
    <p v-else class="text-xs text-sky-400 uppercase tracking-wider py-1">{{ editableStep.step_type }}</p>


    <div v-if="isEditable" class="space-y-3 border-t border-slate-700 pt-3 mt-3">
        <h5 class="text-sm font-medium text-slate-400">Step Details:</h5>
        <!-- Lesson Details -->
        <div v-if="editableStep.step_type === 'lesson'">
            <label :for="'markdown-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Lesson Content (Markdown)</label>
            <textarea :id="'markdown-' + uniqueId" v-model="editableStep.details.markdown_content" @input="emitUpdate" rows="5" class="input-field-intellipath !py-2 text-sm" placeholder="Enter lesson content using Markdown..."></textarea>
        </div>
        <div v-if="editableStep.step_type === 'external_resource'" class="space-y-2">
            <div>
                <label :for="'ext-url-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">External URL</label>
                <input :id="'ext-url-' + uniqueId" type="url" v-model="editableStep.details.external_url" @input="emitUpdate" class="input-field-intellipath !py-2 text-sm" placeholder="https://example.com/resource"/>
            </div>
            <div>
                <label :for="'ext-summary-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Resource Summary</label>
                <textarea :id="'ext-summary-' + uniqueId" v-model="editableStep.details.resource_summary" @input="emitUpdate" rows="2" class="input-field-intellipath !py-2 text-sm" placeholder="Brief summary of the resource..."></textarea>
            </div>
        </div>
         <div v-if="editableStep.step_type === 'video'" class="space-y-2">
            <div>
                <label :for="'video-url-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Video URL (e.g., YouTube, Vimeo)</label>
                <input :id="'video-url-' + uniqueId" type="url" v-model="editableStep.details.video_url" @input="emitUpdate" class="input-field-intellipath !py-2 text-sm" placeholder="https://youtube.com/watch?v=..."/>
            </div>
            <div>
                <label :for="'video-summary-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Video Summary</label>
                <textarea :id="'video-summary-' + uniqueId" v-model="editableStep.details.video_summary" @input="emitUpdate" rows="2" class="input-field-intellipath !py-2 text-sm" placeholder="Brief summary of the video..."></textarea>
            </div>
        </div>
        <p v-if="editableStep.step_type === 'quiz'" class="text-xs text-slate-500">Quiz editor coming soon.</p>
        <p v-if="editableStep.step_type === 'challenge'" class="text-xs text-slate-500">Challenge editor coming soon.</p>
    </div>
    
    <div v-else class="mt-2 text-sm text-slate-300">
        <div v-if="editableStep.step_type === 'lesson'" v-html="renderMarkdown(editableStep.details?.markdown_content || '')" class="prose prose-sm prose-invert max-w-none"></div>
        <div v-if="editableStep.step_type === 'external_resource'">
            <p class="mb-1">{{ editableStep.details?.resource_summary }}</p>
            <a :href="editableStep.details?.external_url" target="_blank" class="app-link">{{ editableStep.details?.external_url }}</a>
        </div>
        <div v-if="editableStep.step_type === 'video'">
            <p class="mb-1">{{ editableStep.details?.video_summary }}</p>
            <a :href="editableStep.details?.video_url" target="_blank" class="app-link">{{ editableStep.details?.video_url }}</a>
        </div>
    </div>

    <div v-if="isEditable" class="mt-2">
        <label :for="'duration-' + uniqueId" class="block text-xs font-medium text-slate-400 mb-1">Est. Duration (minutes)</label>
        <input :id="'duration-' + uniqueId" type="number" v-model.number="editableStep.estimated_duration_minutes" @input="emitUpdate" class="input-field-intellipath !py-2 text-sm w-32" placeholder="e.g., 30"/>
    </div>
    <p v-else-if="editableStep.estimated_duration_minutes" class="text-xs text-slate-500 mt-2">
        Estimated duration: {{ editableStep.estimated_duration_minutes }} minutes
    </p>

  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  stepData: { type: Object, required: true },
  index: { type: Number, required: true },
  isEditable: { type: Boolean, default: false },
});

const emit = defineEmits(['update:step', 'toggle-complete']);

const editableStep = ref({ 
    title: '', 
    step_type: 'lesson',
    details: {}, 
    completed: false, 
    estimated_duration_minutes: null 
});

const uniqueId = computed(() => `edit-step-${props.index}-${props.stepData.id || Math.random().toString(36).substr(2, 9)}`);

watch(() => props.stepData, (newVal) => {
  if (newVal) {
    const details = newVal.details || {};
    if (newVal.step_type === 'lesson' && typeof details.markdown_content === 'undefined') details.markdown_content = '';
    if (newVal.step_type === 'external_resource' && typeof details.external_url === 'undefined') details.external_url = '';
    if (newVal.step_type === 'external_resource' && typeof details.resource_summary === 'undefined') details.resource_summary = '';
    if (newVal.step_type === 'video' && typeof details.video_url === 'undefined') details.video_url = '';
    if (newVal.step_type === 'video' && typeof details.video_summary === 'undefined') details.video_summary = '';

    editableStep.value = { 
        id: newVal.id || `temp-${Date.now()}`,
        title: newVal.title || '',
        step_type: newVal.step_type || 'lesson',
        details: details,
        completed: typeof newVal.completed === 'boolean' ? newVal.completed : false,
        estimated_duration_minutes: newVal.estimated_duration_minutes || null,
     };
  }
}, { deep: true, immediate: true });

const emitUpdate = () => {
  if (props.isEditable) {
    emit('update:step', { ...editableStep.value }, props.index);
  }
};

const toggleAdminCompletion = (event) => {
    const newCompletedStatus = event.target.checked;
    editableStep.value.completed = newCompletedStatus;
    emit('toggle-complete', props.index, newCompletedStatus); 
};

const renderMarkdown = (markdownText) => {
  return markdownText ? marked.parse(markdownText, { breaks: true, gfm: true }) : '<p class="italic text-slate-500">No lesson content provided.</p>';
};

onMounted(() => {
    if (props.stepData && !props.stepData.details) {
        editableStep.value.details = {};
    }
});
</script>