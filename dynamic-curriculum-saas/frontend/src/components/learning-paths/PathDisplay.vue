<template>
  <div class="p-4 space-y-4">
    <h3 class="text-xl font-semibold text-gray-800">{{ pathTitle || 'Your Learning Path' }}</h3>
    <div v-if="isLoading" class="text-center py-8">
        <p class="text-gray-600">Loading learning path...</p>
    </div>
    <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong class="font-bold">Error!</strong>
        <span class="block sm:inline"> {{ error }}</span>
    </div>
    <div v-else-if="pathSteps && pathSteps.length > 0" class="space-y-3">
      <PathStep
        v-for="(step, index) in pathSteps"
        :key="step.topic + index"
        :step-data="step"
        :index="index"
        :is-learner-view="isLearnerView"
        :is-editable="false"
        @toggle-complete="handleToggleComplete"
      />
    </div>
    <div v-else>
      <p class="text-gray-600">No steps found in this learning path, or the path is not yet assigned.</p>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';
import PathStep from './PathStep.vue';

defineProps({
  pathSteps: Array, 
  pathTitle: String,
  isLearnerView: {
    type: Boolean,
    default: false,
  },
  isLoading: Boolean,
  error: String,
});

const emit = defineEmits(['step-completion-toggled']);

const handleToggleComplete = (stepIndex, completed) => {
    emit('step-completion-toggled', stepIndex, completed);
}
</script>