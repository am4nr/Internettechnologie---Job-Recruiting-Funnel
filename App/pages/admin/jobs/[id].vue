<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { useAuthStore } from '~/stores/auth'
import { useToast } from '~/composables/useToast'
import type { Database } from '~/types/database'
import type { Job, FormField } from '~/types/form'
import JobMetadataForm from '~/components/jobs/JobMetadataForm.vue'
import JobDetailsForm from '~/components/jobs/JobDetailsForm.vue'
import FormBuilder from '~/components/form/FormBuilder.vue'

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const currentUser = useSupabaseUser()
const toast = useToast()

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const isNewJob = computed(() => route.params.id === 'new')
const loading = ref(true)
const isSaving = ref(false)
const error = ref<string | null>(null)

// Initialize job with default values
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

// Load job data if editing
const loadJob = async () => {
  if (isNewJob.value) {
    loading.value = false
    return
  }

  try {
    console.log('=== Starting Job Load Process ===')
    loading.value = true
    error.value = null

    const { data: jobData, error: jobError } = await client
      .from('jobs')
      .select(`
        id,
        title,
        description,
        location,
        status,
        tasks,
        requirements,
        benefits,
        form_id,
        created_at,
        updated_at,
        created_by
      `)
      .eq('id', route.params.id)
      .single()

    if (jobError) throw jobError
    if (!jobData) throw new Error('Job not found')

    console.log('Job data loaded:', jobData)
    
    // Update job data
    job.value = jobData

    // Load form schema if exists
    if (jobData.form_id) {
      console.log('Loading form:', jobData.form_id)
      
      const { data: formData, error: formError } = await client
        .from('forms')
        .select('*')
        .eq('id', jobData.form_id)
        .single()

      if (formError) {
        console.error('Error loading form:', formError)
        throw formError
      }
      
      console.log('Form loaded:', formData)

      if (formData?.schema) {
        console.log('Raw form schema:', formData.schema)
        
        // Convert schema to FormField array
        formSchema.value = Array.isArray(formData.schema) 
          ? (formData.schema as any[]).map(field => ({
              id: field?.id || crypto.randomUUID(),
              type: field?.type || 'text',
              name: field?.name || field?.id || crypto.randomUUID(),
              label: field?.label || '',
              validation: field?.validation,
              placeholder: field?.placeholder,
              options: field?.options
            }))
          : []
          
        console.log('Processed form schema:', formSchema.value)
      }
    } else {
      console.log('No form associated with this job')
    }
  } catch (err) {
    console.error('Error loading job:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load job'
  } finally {
    loading.value = false
    console.log('=== Job Load Process Completed ===')
  }
}

// Save job
const saveJob = async () => {
  try {
    console.log('=== Starting Job Save Process ===')
    console.log('Current job data:', job.value)
    console.log('Current form schema:', formSchema.value)
    console.log('Current user:', currentUser.value)
    
    isSaving.value = true
    
    // First save the form if we have form fields
    let formId = job.value.form_id
    if (formSchema.value.length > 0) {
      console.log('Form fields exist, creating/updating form...')
      
      const formData = {
        title: job.value.title + ' Application Form',
        description: 'Application form for ' + job.value.title,
        schema: formSchema.value as Database['public']['Tables']['forms']['Row']['schema'],
        type: 'job_application',
        config: {},
        created_by: currentUser.value?.id,
        updated_at: new Date().toISOString()
      }

      if (formId) {
        // Update existing form
        console.log('Updating existing form:', formId)
        const { error: formError } = await client
          .from('forms')
          .update(formData)
          .eq('id', formId)

        if (formError) {
          console.error('Error updating form:', formError)
          throw formError
        }
        console.log('Form updated successfully')
      } else {
        // Create new form
        console.log('Creating new form...')
        const { data: form, error: formError } = await client
          .from('forms')
          .insert({
            ...formData,
            created_at: new Date().toISOString()
          } satisfies Database['public']['Tables']['forms']['Insert'])
          .select()
          .single()

        if (formError) {
          console.error('Error creating form:', formError)
          throw formError
        }
        if (form) {
          formId = form.id
          console.log('New form created:', formId)
        }
      }
    }
    
    // Then save the job with the form ID
    const jobData = {
      title: job.value.title,
      description: job.value.description,
      location: job.value.location,
      status: job.value.status,
      tasks: job.value.tasks,
      requirements: job.value.requirements,
      benefits: job.value.benefits,
      form_id: formId,
      created_by: job.value.created_by || currentUser.value?.id,
      updated_at: new Date().toISOString()
    } satisfies Database['public']['Tables']['jobs']['Update']

    console.log('Job data to be saved:', jobData)

    let savedJob
    if (isNewJob.value) {
      // Create new job
      const { data, error: jobError } = await client
        .from('jobs')
        .insert({
          ...jobData,
          created_at: new Date().toISOString()
        } satisfies Database['public']['Tables']['jobs']['Insert'])
        .select()
        .single()

      if (jobError) {
        console.error('Error creating job:', jobError)
        throw jobError
      }
      savedJob = data
    } else {
      // Update existing job
      const { data, error: jobError } = await client
        .from('jobs')
        .update(jobData)
        .eq('id', job.value.id)
        .select()
        .single()

      if (jobError) {
        console.error('Error updating job:', jobError)
        throw jobError
      }
      savedJob = data
    }
    
    console.log('Job saved successfully:', savedJob)
    
    toast.add({
      title: 'Success',
      description: 'Job listing saved successfully',
      type: 'success'
    })

    // Redirect to jobs list
    router.push('/admin/jobs')
  } catch (err) {
    console.error('Error saving job:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save job'
    toast.add({
      title: 'Error',
      description: error.value,
      type: 'error'
    })
  } finally {
    isSaving.value = false
  }
}

onMounted(() => {
  loadJob()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">{{ isNewJob ? 'Create Job' : 'Edit Job' }}</h1>
      <div class="flex gap-2">
        <button 
          class="btn btn-primary"
          :disabled="isSaving"
          @click="saveJob"
        >
          <span v-if="isSaving" class="loading loading-spinner loading-xs"></span>
          {{ isNewJob ? 'Create' : 'Save Changes' }}
        </button>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Form -->
    <div v-else class="space-y-6">
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