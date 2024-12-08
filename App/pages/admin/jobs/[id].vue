<!-- pages/admin/jobs/[id].vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Job } from '~/types/jobs'
import type { FormField } from '~/types/form'
import JobFormBuilder from '~/components/jobs/JobFormBuilder.vue'
import JobMetadataForm from '~/components/jobs/JobMetadataForm.vue'

const route = useRoute()
const supabase = useSupabaseClient()
const job = ref<Job | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

// Track form state
const formState = ref<Record<string, any>>({})

onMounted(async () => {
  try {
    const { data, error: fetchError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', route.params.id)
      .single()

    if (fetchError) throw fetchError
    if (!data) throw new Error('Job not found')

    // Initialize job with default application steps if none exist
    job.value = {
      ...data,
      application_steps: data.application_steps || [{
        id: crypto.randomUUID(),
        title: 'Application Form',
        description: '',
        order: 1,
        fields: []
      }]
    }
  } catch (e) {
    console.error('Error loading job:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const handleFieldUpdate = (stepId: string, fieldId: string, value: any) => {
  formState.value[`${stepId}_${fieldId}`] = value
}

const saveJob = async () => {
  if (!job.value) return
  
  try {
    loading.value = true
    error.value = null
    
    const { error: saveError } = await supabase
      .from('jobs')
      .update({
        ...job.value,
        updated_at: new Date().toISOString()
      })
      .eq('id', job.value.id)

    if (saveError) throw saveError
    
  } catch (e) {
    error.value = e.message
    console.error('Error saving job:', e)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div v-if="loading" class="loading loading-spinner text-primary"></div>
    
    <div v-else-if="error" class="alert alert-error">{{ error }}</div>

    <template v-else-if="job">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold">Edit Job</h1>
        <NuxtLink to="/admin/jobs" class="btn btn-ghost">
          Back to Jobs
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
            Save Changes
          </button>
        </div>
      </form>
    </template>
  </div>
</template>