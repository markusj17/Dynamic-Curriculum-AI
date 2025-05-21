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
    <div class="mt-4 space-y-2">
      <router-link :to="{ name: 'EmployeeDetail', params: { id: employee.id } }" class="btn-intellipath-secondary w-full !py-2 text-sm block text-center">
        View Details & Edit Path
      </router-link>
      <button 
        v-if="employee.learningPath && (employee.learningPath.status === 'assigned' || employee.learningPath.status === 'in_progress' || employee.learningPath.status === 'completed')"
        @click="copyShareableLink(employee.id)" 
        class="btn-intellipath-primary w-full !py-2 !bg-opacity-80 hover:!bg-opacity-100 text-sm flex items-center justify-center"
        title="Copy link for employee to view their path">
        <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
        {{ linkCopiedState[employee.id] ? 'Link Copied!' : 'Share Path Link' }}
      </button>
       <p v-else-if="employee.learningPath && employee.learningPath.status === 'draft'" class="text-xs text-center text-yellow-400/80">
        Path is in draft. Assign to share.
      </p>
      <p v-else class="text-xs text-center text-slate-500">
        Generate & assign a path to share.
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'; // Added reactive

const props = defineProps({
  employee: {
    type: Object,
    required: true,
  },
});

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
    console.log('Link copied to clipboard:', shareableLink);
    setTimeout(() => {
      linkCopiedState[employeeId] = false;
    }, 2000); // Reset after 2 seconds
  } catch (err) {
    console.error('Failed to copy link: ', err);
    alert('Failed to copy link. Please copy it manually: ' + shareableLink);
  }
};
</script>