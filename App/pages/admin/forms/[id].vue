<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database, Json } from '~/types/database'
import type { FormField } from '~/types/form'
import { useToast } from '~/composables/useToast'
import FormBuilder from '~/components/form/FormBuilder.vue'

definePageMeta({
  middleware: ['auth'],
  requiresRole: 'admin',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient<Database>()
const toast = useToast()

// Ensure user is authenticated
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

const loading = ref(false)
const error = ref<string | null>(null)
const template = ref<Database['public']['Tables']['form_templates']['Row']>({
  id: route.params.id === 'new' ? crypto.randomUUID() : route.params.id as string,
  title: '',
  description: null,
  schema: [],
  type: 'job_application',
  is_active: true,
  config: null,
  created_at: new Date().toISOString(),
  updated_at: null,
  created_by: user.id
})

// Load template if editing
onMounted(async () => {
  if (route.params.id === 'new') return
  
  try {
    loading.value = true
    
    // Load template
    const { data: templateData, error: templateError } = await supabase
      .from('form_templates')
      .select('*')
      .eq('id', route.params.id)
      .single()
    
    if (templateError) throw templateError

    if (templateData) {
      const schemaFields = Array.isArray(templateData.schema) ? templateData.schema : []
      template.value = {
        ...templateData,
        schema: schemaFields.map((field: any) => ({
          id: field?.id || crypto.randomUUID(),
          type: field?.type || 'text',
          name: field?.name || '',
          label: field?.label || '',
          validation: field?.validation,
          placeholder: field?.placeholder,
          options: field?.options
        })) as FormField[]
      }
    }
  } catch (err) {
    const e = err as Error
    console.error('Error loading template:', e)
    error.value = e.message
    toast.add({
      title: 'Error',
      description: 'Failed to load template',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  try {
    loading.value = true

    const templateData: Database['public']['Tables']['form_templates']['Insert'] = {
      id: template.value.id,
      title: template.value.title,
      description: template.value.description,
      schema: template.value.schema as unknown as Json,
      type: template.value.type,
      is_active: template.value.is_active,
      config: template.value.config,
      created_by: user.id
    }

    // Save template
    const { error: templateError } = await supabase
      .from('form_templates')
      .upsert(templateData)
    
    if (templateError) throw templateError

    toast.add({
      title: 'Success',
      description: 'Template saved successfully',
      type: 'success'
    })

    router.push('/admin/forms')
  } catch (err) {
    const e = err as Error
    console.error('Error saving template:', e)
    error.value = e.message
    toast.add({
      title: 'Error',
      description: 'Failed to save template',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/forms')
}
</script>

<template>
  <div class="container mx-auto p-4">
    <!-- Header -->
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">
        {{ route.params.id === 'new' ? 'Create Form Template' : 'Edit Form Template' }}
      </h1>
      <div class="flex gap-2">
        <button 
          @click="handleCancel"
          class="btn"
        >
          Cancel
        </button>
        <button 
          @click="handleSave"
          class="btn btn-primary"
          :disabled="loading"
        >
          <span v-if="loading" class="loading loading-spinner loading-xs"></span>
          {{ loading ? 'Saving...' : 'Save Template' }}
        </button>
      </div>
    </div>

    <!-- Error Display -->
    <div v-if="error" class="alert alert-error mb-4">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <div v-else class="space-y-6">
      <!-- Template Settings -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Template Settings</h2>
          
          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Title</span>
            </label>
            <input 
              v-model="template.title"
              type="text"
              class="input input-bordered w-full"
              placeholder="Enter template title"
            />
          </div>

          <div class="form-control w-full mb-4">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="template.description"
              class="textarea textarea-bordered w-full"
              placeholder="Enter template description"
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Active</span>
              <input 
                v-model="template.is_active"
                type="checkbox"
                class="toggle toggle-primary"
              />
            </label>
          </div>
        </div>
      </div>

      <!-- Form Builder -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Form Fields</h2>
          <FormBuilder v-model="template.schema" />
        </div>
      </div>
    </div>
  </div>
</template> 