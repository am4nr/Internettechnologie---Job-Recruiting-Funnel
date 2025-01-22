<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { FormTemplate, FormField } from '~/types/form'
import { useFormTemplates } from '~/composables/useFormTemplates'
import { useToast } from '~/composables/useToast'

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const { getTemplates, createTemplate } = useFormTemplates()
const toast = useToast()

const templates = ref<FormTemplate[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Search params
const searchQuery = ref('')
const currentPage = ref(1)
const pageSize = ref(10)
const totalPages = ref(0)

// Load templates
const loadTemplates = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const result = await getTemplates({
      search_query: searchQuery.value || undefined,
      page_number: currentPage.value,
      page_size: pageSize.value
    })
    
    templates.value = result.data
    totalPages.value = result.pagination.total_pages
  } catch (err) {
    console.error('Error loading templates:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load templates'
    toast.add({
      title: 'Error',
      description: error.value,
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

const cloneExistingTemplate = async (template: FormTemplate) => {
  try {
    await createTemplate({
      title: `${template.title} (Copy)`,
      description: template.description,
      schema: template.schema,
      type: 'job_application',
      is_active: true
    })
    
    toast.add({
      title: 'Success',
      description: `${template.title} cloned successfully`,
      type: 'success'
    })
    
    loadTemplates()
  } catch (err) {
    console.error('Error cloning template:', err)
    toast.add({
      title: 'Error',
      description: 'Failed to clone template',
      type: 'error'
    })
  }
}

// Handle search
const handleSearch = () => {
  currentPage.value = 1
  loadTemplates()
}

// Handle page change
const handlePageChange = (page: number) => {
  currentPage.value = page
  loadTemplates()
}

// Load templates on mount
onMounted(loadTemplates)
</script>

<template>
  <div class="container mx-auto p-4 space-y-6">
    <!-- Header -->
    <div class="flex justify-between items-center">
      <h1 class="text-2xl font-bold">Form Templates</h1>
      <NuxtLink to="/admin/forms/new" class="btn btn-primary gap-2">
        <i class="fas fa-plus" />
        New Template
      </NuxtLink>
    </div>

    <!-- Search -->
    <div class="form-control">
      <div class="input-group">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search templates..."
          class="input input-bordered w-full"
          @keyup.enter="handleSearch"
        />
        <button 
          class="btn btn-square" 
          @click="handleSearch"
          aria-label="Search templates"
        >
          <i class="fas fa-search" aria-hidden="true" />
        </button>
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
      <button class="btn btn-sm btn-ghost" @click="loadTemplates">
        Try Again
      </button>
    </div>

    <!-- Templates List -->
    <div v-else-if="templates.length > 0" class="space-y-4">
      <div v-for="template in templates" :key="template.id" class="card bg-base-100 shadow hover:shadow-md transition-shadow">
        <div class="card-body">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="card-title">{{ template.title }}</h3>
              <p v-if="template.description" class="text-base-content/70">
                {{ template.description }}
              </p>
              <div class="mt-2 space-x-2">
                <div class="badge" :class="template.is_active ? 'badge-success' : 'badge-ghost'">
                  {{ template.is_active ? 'Active' : 'Inactive' }}
                </div>
                <div class="badge badge-outline">
                  {{ template.schema.length }} fields
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <NuxtLink
                :to="`/admin/forms/${template.id}`"
                class="btn btn-ghost btn-sm"
                :aria-label="`Edit ${template.title}`"
              >
                <i class="fas fa-pencil" aria-hidden="true" />
              </NuxtLink>
              <button
                class="btn btn-ghost btn-sm"
                :aria-label="`Clone ${template.title}`"
                @click="cloneExistingTemplate(template)"
              >
                <i class="fas fa-copy" aria-hidden="true" />
              </button>
            </div>
          </div>
          <div class="card-actions justify-between items-center mt-4 text-sm text-base-content/70">
            <div class="space-x-4">
              <span>
                Created: {{ new Date(template.created_at || '').toLocaleDateString() }}
              </span>
              <span v-if="template.updated_at">
                Updated: {{ new Date(template.updated_at).toLocaleDateString() }}
              </span>
            </div>
            <div v-if="template.created_by_email" class="flex items-center gap-2">
              <i class="fas fa-user" aria-hidden="true" />
              {{ template.created_by_email }}
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
      <div class="text-base-content/70">No form templates found</div>
      <p class="mt-2">Start by creating a template from scratch or use one of our predefined templates above.</p>
    </div>
  </div>
</template> 