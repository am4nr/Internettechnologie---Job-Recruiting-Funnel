// pages/admin/jobs/new.vue
<script setup lang="ts">
import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'
import type { Job } from '~/types/jobs'
import JobFormBuilder from '~/components/jobs/JobFormBuilder.vue'
import JobMetadataForm from '~/components/jobs/JobMetadataForm.vue'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const supabase = useSupabaseClient<Database>()
const router = useRouter()
const loading = ref(false)
const error = ref<string | null>(null)

// Initialize job with default values
const job = ref<Job>({
  title: '',
  description: '',
  department: '',
  location: '',
  status: 'draft',
  job_details: {
    requirements: [],
    responsibilities: [],
    salary_range: ''
  },
  meta: {},
  application_steps: [{
    id: crypto.randomUUID(),
    title: 'Application Form',
    description: '',
    order: 1,
    fields: []
  }]
})

const saveJob = async () => {
  try {
    loading.value = true
    error.value = null

    const jobData = {
      title: job.value.title,
      description: job.value.description,
      department: job.value.department,
      location: job.value.location,
      status: job.value.status,
      job_details: job.value.job_details,
      meta: job.value.meta,
      application_steps: job.value.application_steps,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    const { data, error: saveError } = await supabase
      .from('jobs')
      .insert(jobData)
      .select()
      .single()

    if (saveError) throw saveError

    router.push('/admin/jobs')
  } catch (e: any) {
    error.value = e.message
    console.error('Error saving job:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Create New Job</h1>
      <NuxtLink to="/admin/jobs" class="btn btn-ghost">
        Back
      </NuxtLink>
    </div>

    <form @submit.prevent="saveJob" class="space-y-6">
      <!-- Job Metadata -->
      <JobMetadataForm v-model="job" />

      <!-- Application Steps -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Application Process</h2>
          <JobFormBuilder v-model="job.application_steps" />
        </div>
      </div>

      <!-- Save Actions -->
      <div class="flex justify-end gap-4">
        <NuxtLink to="/admin/jobs" class="btn">Cancel</NuxtLink>
        <button type="submit" class="btn btn-primary" :disabled="loading">
          <i v-if="loading" class="fas fa-spinner fa-spin mr-2"></i>
          Create Job
        </button>
      </div>

      <div v-if="error" class="alert alert-error">
        {{ error }}
      </div>
    </form>
  </div>
</template>