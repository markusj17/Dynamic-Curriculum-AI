<template>
  <div class="card-intellipath p-5 space-y-3 flex flex-col justify-between">
    <div>
      <h3 class="text-lg font-semibold text-sky-400 truncate">{{ employee.name }}</h3>
      <p class="text-sm text-slate-400 truncate">{{ employee.current_role || 'No role specified' }}</p>
      <div class="mt-2 text-xs">
        <span class="font-medium text-slate-500">Path Status: </span>
        <span :class="pathStatusColor(employee.learningPath?.status)" class="px-2 py-0.5 rounded-full font-semibold">
          {{ employee.learningPath?.status || 'Not Generated' }}
        </span>
      </div>
    </div>
    <div class="mt-4">
      <router-link :to="{ name: 'EmployeeDetail', params: { id: employee.id } }" class="btn-intellipath-secondary w-full !py-2 text-sm">
        View Details & Path
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});

const pathStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'bg-yellow-500/20 text-yellow-400';
    case 'assigned': return 'bg-blue-500/20 text-blue-400';
    case 'in_progress': return 'bg-sky-500/20 text-sky-400';
    case 'completed': return 'bg-emerald-500/20 text-emerald-400';
    default: return 'bg-slate-700 text-slate-400';
  }
};
</script>