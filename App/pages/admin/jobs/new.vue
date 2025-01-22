<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useToast } from '~/composables/useToast'
import type { Database } from '~/types/database'
import type { Job, FormField } from '~/types/form'
import type { Json } from '~/types/database'
import JobMetadataForm from '~/components/jobs/JobMetadataForm.vue'
import JobDetailsForm from '~/components/jobs/JobDetailsForm.vue'
import FormBuilder from '~/components/form/FormBuilder.vue'

const router = useRouter()
const client = useSupabaseClient<Database>()
const currentUser = useSupabaseUser()
const toast = useToast()

const loading = ref(false)
const error = ref<string | null>(null)

// Initialize new job with default values
const job = ref<Job>({
  id: '',
  title: '',
  description: null,
  location: null,
  status: 'draft',
  tasks: null,
  requirements: null,
  benefits: null,
  form_id: null,
  created_at: null,
  updated_at: null,
  created_by: null
})

const formSchema = ref<FormField[]>([])

const saveForm = async (fields: FormField[]): Promise<string> => {
  const { data: form, error } = await client
    .from('forms')
    .insert({
      title: job.value.title + ' Application Form',
      description: 'Application form for ' + job.value.title,
      schema: fields as unknown as Json,
      type: 'job_application',
      config: {},
      created_by: currentUser.value?.id
    })
    .select()
    .single()

  if (error) throw error
  return form.id
}

const saveJob = async () => {
  try {
    console.log('=== Starting Job Save Process ===')
    console.log('Current job data:', job.value)
    console.log('Current form schema:', formSchema.value)
    console.log('Current user:', currentUser.value)
    
    loading.value = true
    
    // First create the form
    const formId = await saveForm(formSchema.value)
    
    // Then save the job with the form ID, omitting the empty id field
    const { error } = await client
      .from('jobs')
      .insert({
        ...job.value,
        id: undefined, // Remove empty id so Postgres can generate one
        form_id: formId,
        updated_at: new Date().toISOString()
      })

    if (error) throw error
    
    toast.add({
      title: 'Success',
      description: 'Job listing saved successfully',
      type: 'success'
    })

    console.log('=== Job Save Process Completed Successfully ===')
    
    // Redirect after successful save
    router.push('/admin/jobs')
  } catch (err) {
    console.error('=== Job Save Process Failed ===')
    console.error('Error details:', err)
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Failed to save job listing',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Create New Job</h1>
      <div class="flex gap-2">
        <button 
          class="btn btn-primary"
          :disabled="loading"
          @click="saveJob"
        >
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          Create Job
        </button>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error" class="alert alert-error mb-4">
      {{ error }}
    </div>

    <!-- Form -->
    <div class="space-y-6">
      <!-- Basic Information -->
      <JobMetadataForm v-model="job" />

      <!-- Job Details -->
      <JobDetailsForm v-model="job" />

      <!-- Form Builder -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Application Form</h2>
          <FormBuilder v-model="formSchema" />
        </div>
      </div>
    </div>
  </div>
</template>