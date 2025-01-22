<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormSubmission, FormField } from '~/types/form'
import { useFormSubmissions } from '~/composables/useFormSubmissions'

interface SubmittedBy {
  id: string
  email: string
}

const props = defineProps<{
  submissionId: string
}>()

const { getSubmission } = useFormSubmissions()
const submission = ref<FormSubmission | null>(null)
const isLoading = ref(true)
const error = ref<string | null>(null)

// Load submission data
const loadSubmission = async () => {
  try {
    isLoading.value = true
    error.value = null
    submission.value = await getSubmission(props.submissionId)
  } catch (err) {
    console.error('Error loading submission:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load submission'
  } finally {
    isLoading.value = false
  }
}

// Format submission data for display
const formattedData = computed(() => {
  if (!submission.value || !submission.value.template.schema) return []

  const schema = submission.value.template.schema as FormField[]
  const data = submission.value.form_data as Record<string, any>

  return schema.map(field => {
    const value = data[field.name]
    let displayValue = value

    // Format value based on field type
    if (field.$formkit === 'select' || field.$formkit === 'radio' || field.$formkit === 'checkbox') {
      const option = field.options?.find(opt => opt.value === value)
      displayValue = option?.label || value
    }

    return {
      label: field.label,
      value: displayValue
    }
  })
})

// Format submission metadata
const metadata = computed(() => {
  if (!submission.value) return null

  const submittedBy = submission.value.submitted_by as string | SubmittedBy
  
  return {
    submittedBy: typeof submittedBy === 'string' ? submittedBy : submittedBy.email,
    submittedAt: new Date(submission.value.created_at).toLocaleString(),
    jobTitle: submission.value.job.title,
    updatedAt: submission.value.updated_at 
      ? new Date(submission.value.updated_at).toLocaleString() 
      : null
  }
})

// Load submission on mount
loadSubmission()
</script>

<template>
  <div class="space-y-6">
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="loading loading-spinner loading-lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <i class="fas fa-exclamation-circle" />
      <span>{{ error }}</span>
    </div>

    <!-- Submission Data -->
    <template v-else-if="submission">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold">
            {{ submission.template.title }}
          </h2>
          <p v-if="submission.template.description" class="text-base-content/70">
            {{ submission.template.description }}
          </p>
        </div>
        <div class="badge" :class="{
          'badge-success': submission.status === 'approved',
          'badge-error': submission.status === 'rejected',
          'badge-warning': submission.status === 'pending'
        }">
          {{ submission.status }}
        </div>
      </div>

      <!-- Submission Info -->
      <div class="card bg-base-100 shadow">
        <div class="card-body">
          <div class="grid gap-6">
            <div v-for="field in formattedData" :key="field.label" class="space-y-1">
              <div class="font-medium">{{ field.label }}</div>
              <div class="text-base-content/70">{{ field.value || 'Not provided' }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Files -->
      <div v-if="submission.files?.length" class="card bg-base-100 shadow">
        <div class="card-body">
          <h3 class="card-title">Attachments</h3>
          <div class="space-y-2">
            <a
              v-for="file in submission.files"
              :key="file.name"
              :href="file.url"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-2 p-2 rounded hover:bg-base-200"
            >
              <i class="fas fa-file" />
              <span>{{ file.name }}</span>
              <i class="fas fa-external-link-alt ml-auto" />
            </a>
          </div>
        </div>
      </div>

      <!-- Metadata -->
      <div v-if="metadata" class="card bg-base-200">
        <div class="card-body">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span class="text-base-content/70">Submitted by:</span>
              <span class="ml-2">{{ metadata.submittedBy }}</span>
            </div>
            <div>
              <span class="text-base-content/70">Submitted on:</span>
              <span class="ml-2">{{ metadata.submittedAt }}</span>
            </div>
            <div>
              <span class="text-base-content/70">Job:</span>
              <span class="ml-2">{{ metadata.jobTitle }}</span>
            </div>
            <div v-if="metadata.updatedAt">
              <span class="text-base-content/70">Last updated:</span>
              <span class="ml-2">{{ metadata.updatedAt }}</span>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Empty State -->
    <div v-else class="text-center py-12 text-base-content/70">
      No submission data available
    </div>
  </div>
</template> 
