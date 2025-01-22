<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FormSubmission, FormTemplate } from '~/types/form'
import { useFormSubmissions } from '~/composables/useFormSubmissions'
import { useFormTemplates } from '~/composables/useFormTemplates'
import { useToast } from '~/composables/useToast'

interface SubmittedBy {
  id: string
  email: string
}

const route = useRoute()
const templateId = route.params.id as string

const { getSubmissions } = useFormSubmissions()
const { getTemplate } = useFormTemplates()
const toast = useToast()

const template = ref<FormTemplate | null>(null)
const submissions = ref<FormSubmission[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Search params
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)
const statusFilter = ref<string | undefined>(undefined)

// Status options
const statusOptions = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

// Load template and submissions
const loadData = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    // Load template
    const templateData = await getTemplate(templateId)
    template.value = templateData.template
    
    // Load submissions
    const result = await getSubmissions({
      template_id: templateId,
      status: statusFilter.value,
      page_number: currentPage.value,
      page_size: pageSize.value
    })
    
    submissions.value = result.data
    totalPages.value = result.pagination.total_pages
  } catch (err) {
    console.error('Error loading data:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load data'
    toast.add({
      title: 'Error',
      description: error.value,
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

// Handle filter change
const handleFilterChange = () => {
  currentPage.value = 1
  loadData()
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadData()
}

// Format date
const formatDate = (date: string) => {
  return new Date(date).toLocaleString()
}

// Get submitter info
const getSubmitterInfo = (submittedBy: string | SubmittedBy) => {
  return typeof submittedBy === 'string' ? submittedBy : submittedBy.email
}

// Load data on mount
onMounted(loadData)
</script>

<template>
  <div class="container mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-start">
      <div>
        <div class="flex items-center gap-2">
          <NuxtLink 
            :to="`/admin/forms/${templateId}`"
            class="btn btn-ghost btn-sm"
            aria-label="Back to template"
          >
            <i class="fas fa-arrow-left" aria-hidden="true" />
          </NuxtLink>
          <h1 class="text-2xl font-bold">
            {{ template?.title || 'Form Submissions' }}
          </h1>
        </div>
        <p v-if="template?.description" class="mt-1 text-base-content/70">
          {{ template.description }}
        </p>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex gap-4">
      <div class="form-control">
        <select
          v-model="statusFilter"
          class="select select-bordered"
          @change="handleFilterChange"
        >
          <option 
            v-for="option in statusOptions" 
            :key="option.value || 'all'"
            :value="option.value"
          >
            {{ option.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center items-center py-12">
      <div class="loading loading-spinner loading-lg" />
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <i class="fas fa-exclamation-circle" aria-hidden="true" />
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-ghost" @click="loadData">
        Try Again
      </button>
    </div>

    <!-- Submissions List -->
    <div v-else-if="submissions.length > 0" class="space-y-4">
      <div v-for="submission in submissions" :key="submission.id" class="card bg-base-100 shadow hover:shadow-md transition-shadow">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="card-title">
                {{ submission.job.title }}
              </h3>
              <div class="mt-2">
                <div class="badge" :class="{
                  'badge-success': submission.status === 'approved',
                  'badge-error': submission.status === 'rejected',
                  'badge-warning': submission.status === 'pending'
                }">
                  {{ submission.status }}
                </div>
              </div>
            </div>
            <NuxtLink
              :to="`/admin/forms/${templateId}/submissions/${submission.id}`"
              class="btn btn-ghost btn-sm"
              :aria-label="`View submission details`"
            >
              <i class="fas fa-eye" aria-hidden="true" />
            </NuxtLink>
          </div>
          <div class="card-actions justify-between items-center mt-4 text-sm text-base-content/70">
            <div class="space-x-4">
              <span>
                Submitted: {{ formatDate(submission.created_at) }}
              </span>
              <span v-if="submission.updated_at">
                Updated: {{ formatDate(submission.updated_at) }}
              </span>
            </div>
            <div class="flex items-center gap-2">
              <i class="fas fa-user" aria-hidden="true" />
              {{ getSubmitterInfo(submission.submitted_by) }}
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="flex justify-center mt-6">
        <div class="join">
          <button
            v-for="page in totalPages"
            :key="page"
            class="join-item btn"
            :class="page === currentPage ? 'btn-active' : ''"
            @click="handlePageChange(page)"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-base-content/70">No submissions found</div>
    </div>
  </div>
</template> 
