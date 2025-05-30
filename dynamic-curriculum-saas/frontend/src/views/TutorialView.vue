<template>
  <div class="min-h-screen bg-slate-900 text-slate-200 py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-3xl mx-auto">
      <div class="text-center mb-10">
        <router-link to="/" class="inline-block mb-6">
          <img :src="logoUrl" alt="IntelliPath Logo" class="mx-auto h-10 w-auto" />
        </router-link>
        <h1 class="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-cyan-300 to-teal-300">
          How to Use IntelliPath
        </h1>
        <p class="mt-4 text-lg text-slate-400">
          A quick guide to get you started with creating personalized learning paths.
        </p>
      </div>

      <div class="space-y-12">
        <div class="card-intellipath p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-sky-400 mb-3">
            <span class="bg-sky-500/20 text-sky-300 rounded-full h-8 w-8 flex items-center justify-center mr-3 float-left text-base">1</span>
            Dashboard Overview
          </h2>
          <p class="text-slate-300 leading-relaxed">
            Welcome to your L&D Dashboard! This is your central hub for managing employees and their learning journeys. Here you'll see:
          </p>
          <ul class="list-disc list-inside mt-3 text-slate-400 space-y-1 pl-4">
            <li>A summary of total employees.</li>
            <li>The number of learning paths currently in progress.</li>
            <li>The count of successfully completed learning paths.</li>
            <li>An overview of all your employees.</li>
          </ul>
          <p class="mt-3 text-slate-300">
            You can add new employees directly from the dashboard using the "+ Add Employee" button.
          </p>
          <div class="mt-4 bg-slate-700/50 rounded-lg p-4 text-center text-slate-500 italic h-40 flex items-center justify-center">
            [Will add Screenshot/GIF of Dashboard Overview]
          </div>
        </div>

        <div class="card-intellipath p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-sky-400 mb-3">
            <span class="bg-sky-500/20 text-sky-300 rounded-full h-8 w-8 flex items-center justify-center mr-3 float-left text-base">2</span>
            Adding and Managing Employees
          </h2>
          <p class="text-slate-300 leading-relaxed">
            To start creating personalized learning paths, you first need to add your employees:
          </p>
          <ol class="list-decimal list-inside mt-3 text-slate-400 space-y-2 pl-4">
            <li>Click the <span class="font-semibold text-sky-300">"+ Add Employee"</span> button on the dashboard.</li>
            <li>Fill in the employee's details in the modal that appears: Full Name, Email (optional), Current Role.</li>
            <li>Crucially, provide their <span class="font-semibold text-slate-100">Current Skills</span> and their <span class="font-semibold text-slate-100">Desired Skills / Career Goal</span>. This information is vital for the AI to generate a relevant path.</li>
            <li>Click "Add Employee". The employee will now appear in your "Employee Overview".</li>
            <li>You can view/edit an employee's details or delete them by clicking on their card in the overview.</li>
          </ol>
          <div class="mt-4 bg-slate-700/50 rounded-lg p-4 text-center text-slate-500 italic h-40 flex items-center justify-center">
            [Will add Screenshot/GIF of Add Employee Modal & Employee List Item]
          </div>
        </div>

        <div class="card-intellipath p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-sky-400 mb-3">
            <span class="bg-sky-500/20 text-sky-300 rounded-full h-8 w-8 flex items-center justify-center mr-3 float-left text-base">3</span>
            Generating an AI-Powered Learning Path
          </h2>
          <p class="text-slate-300 leading-relaxed">
            Once an employee's skills and goals are defined:
          </p>
          <ol class="list-decimal list-inside mt-3 text-slate-400 space-y-2 pl-4">
            <li>Navigate to the employee's detail page.</li>
            <li>In the "Learning Path" section, click the <span class="font-semibold text-sky-300">"Generate Path with AI"</span> (or "Regenerate") button.</li>
            <li>IntelliPath's AI will analyze the provided skills and goals to create a personalized list of learning steps, including suggested topics, descriptions, and links to resources.</li>
            <li>This process might take a few moments.</li>
          </ol>
          <div class="mt-4 bg-slate-700/50 rounded-lg p-4 text-center text-slate-500 italic h-40 flex items-center justify-center">
            [Will add Screenshot/GIF of Generate Path button and initial path display]
          </div>
        </div>
        
        <div class="card-intellipath p-6 md:p-8">
          <h2 class="text-2xl font-semibold text-sky-400 mb-3">
            <span class="bg-sky-500/20 text-sky-300 rounded-full h-8 w-8 flex items-center justify-center mr-3 float-left text-base">4</span>
            Curating and Assigning the Path
          </h2>
          <p class="text-slate-300 leading-relaxed">
            After the AI generates the path, you have full control:
          </p>
          <ul class="list-disc list-inside mt-3 text-slate-400 space-y-1 pl-4">
            <li>Review each step: topic, description, and suggested link.</li>
            <li>You can edit any part of any step directly on the page. Change topics, rewrite descriptions, or replace AI-suggested links with your preferred internal or external resources.</li>
            <li>Once you're satisfied, you can either <span class="font-semibold text-slate-100">"Save as Draft"</span> to continue working later, or <span class="font-semibold text-slate-100">"Save and Assign Path"</span> to make it available to the employee.</li>
            <li>(Future Feature Placeholder: Employees will be able to view their assigned paths and mark steps as complete.)</li>
          </ul>
           <div class="mt-4 bg-slate-700/50 rounded-lg p-4 text-center text-slate-500 italic h-40 flex items-center justify-center">
            [Will add Screenshot/GIF of editing a path step and save/assign buttons]
          </div>
        </div>

        <div class="text-center pt-8">
          <p class="text-slate-400">Need more help or have specific questions?</p>
          <router-link to="/contact" class="font-medium text-sky-400 hover:text-sky-300 transition-colors">
            Contact Support
          </router-link>
          <p class="mt-6">
            <router-link to="/dashboard" v-if="authStore.isAuthenticated" class="btn-intellipath-secondary">
              Back to Dashboard
            </router-link>
            <router-link to="/" v-else class="btn-intellipath-secondary">
              Back to Homepage
            </router-link>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import logoUrl from '../assets/intellipath-logo.png'; 
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
</script>

<style scoped>

h2 span.float-left {
  display: inline-block;
  vertical-align: middle;
}
h2 {
  clear: left;
}
</style>