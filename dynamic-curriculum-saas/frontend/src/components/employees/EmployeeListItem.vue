<template>
  <div class="card-intellipath p-5 space-y-3 flex flex-col justify-between h-full"> {/* Added h-full */}
    <div>
      <h3 class="text-lg font-semibold text-sky-400 truncate" :title="employee.name">{{ employee.name }}</h3>
      <p class="text-sm text-slate-400 truncate" :title="employee.current_role">{{ employee.current_role || 'No role specified' }}</p>
      <p class="text-xs text-slate-500 truncate mt-0.5" :title="employee.username">Login: {{ employee.username }}</p>
      <div class="mt-2 text-xs">
        <span class="font-medium text-slate-500">Path Status: </span>
        <span :class="pathStatusColor(employee.learningPath?.status)" class="px-2 py-0.5 rounded-full font-semibold">
          {{ employee.learningPath?.status || 'Not Generated' }}
        </span>
      </div>
    </div>
    <div class="mt-4 space-y-2 pt-2 border-t border-slate-700/50"> {/* Added border */}
      <router-link :to="{ name: 'EmployeeDetail', params: { id: employee.id } }" class="btn-intellipath-secondary w-full !py-1.5 text-xs sm:text-sm block text-center">
        View Details & Path
      </router-link>
      <button 
        @click="$emit('regenerate-creds', employee.id)" 
        class="btn-intellipath-secondary w-full !py-1.5 !border-yellow-600/50 hover:!border-yellow-500 !text-yellow-400 hover:!text-yellow-300 text-xs sm:text-sm flex items-center justify-center"
        title="Regenerate login credentials for this employee">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"></path></svg>
        Regen Credentials
      </button>
      <button 
        v-if="employee.learningPath && ['assigned', 'in_progress', 'completed'].includes(employee.learningPath.status)"
        @click="copyShareableLink(employee.id)" 
        class="btn-intellipath-primary w-full !py-1.5 text-xs sm:text-sm flex items-center justify-center"
        title="Copy link for employee to view their path">
        <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        {{ linkCopiedState[employee.id] ? 'Copied!' : 'Share Link' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue';

defineProps({ employee: { type: Object, required: true } });
const emit = defineEmits(['regenerate-creds']);

const linkCopiedState = reactive({});

const pathStatusColor = (status) => {
  switch (status) {
    case 'draft': return 'bg-yellow-500/20 text-yellow-300 border border-yellow-600';
    case 'assigned': return 'bg-blue-500/20 text-blue-300 border border-blue-600';
    case 'in_progress': return 'bg-sky-500/20 text-sky-300 border border-sky-600';
    case 'completed': return 'bg-emerald-500/20 text-emerald-300 border border-emerald-600';
    default: return 'bg-slate-700/50 text-slate-400 border border-slate-600';
  }
};

const copyShareableLink = async (employeeId) => {
  const baseUrl = window.location.origin;
  const shareableLink = `${baseUrl}/mylearning/${employeeId}`;
  try {
    await navigator.clipboard.writeText(shareableLink);
    linkCopiedState[employeeId] = true;
    setTimeout(() => { linkCopiedState[employeeId] = false; }, 2000);
  } catch (err) {
    prompt("Failed to auto-copy. Please copy manually:", shareableLink);
  }
};
</script>