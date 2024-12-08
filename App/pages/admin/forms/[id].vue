<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { FormTemplate } from '~/types/form'

definePageMeta({
  middleware: ['auth'],
  requiresRole: 'admin',
  layout: 'admin'
})

const route = useRoute()
const router = useRouter()
const supabase = useSupabaseClient()

// Ensure user is authenticated
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

const loading = ref(false)
const error = ref<string | null>(null)
const template = ref<FormTemplate>({
  id: route.params.id === 'new' ? crypto.randomUUID() : route.params.id as string,
  title: '',
  description: '',
  is_active: true,
  steps: [],
  meta: {}
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

    // Load steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('form_steps')
      .select('*')
      .eq('form_template_id', route.params.id)
      .order('order_index', { ascending: true })
    
    if (stepsError) throw stepsError

    // Load fields for each step
    const steps = await Promise.all(stepsData.map(async (step) => {
      const { data: fieldsData, error: fieldsError } = await supabase
        .from('form_fields')
        .select('*')
        .eq('step_id', step.id)
        .order('order_index', { ascending: true })
      
      if (fieldsError) throw fieldsError

      return {
        ...step,
        id: step.id,
        title: step.title,
        description: step.description,
        order: step.order_index,
        fields: fieldsData.map(field => ({
          ...field,
          id: field.id,
          type: field.type,
          label: field.label,
          description: field.description,
          required: field.is_required,
          order: field.order_index,
          options: field.options,
          validation: field.validation_rules,
          conditions: field.condition_logic?.conditions || []
        }))
      }
    }))

    template.value = {
      id: templateData.id,
      title: templateData.title,
      description: templateData.description,
      is_active: templateData.is_active,
      steps,
      meta: templateData.meta
    }
  } catch (err) {
    const e = err as Error
    console.error('Error loading template:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const handleSave = async () => {
  try {
    loading.value = true

    // Save template
    const { error: templateError } = await supabase
      .from('form_templates')
      .upsert({
        id: template.value.id,
        title: template.value.title,
        description: template.value.description,
        is_active: template.value.is_active,
        meta: template.value.meta,
        created_by: user.id
      })
    
    if (templateError) throw templateError

    // Save steps
    for (const [index, step] of template.value.steps.entries()) {
      // Save step
      const { data: savedStep, error: stepError } = await supabase
        .from('form_steps')
        .upsert({
          id: step.id,
          form_template_id: template.value.id,
          title: step.title,
          description: step.description,
          order_index: index,
          is_conditional: step.conditions?.length > 0 || false,
          condition_logic: step.conditions ? { conditions: step.conditions } : {}
        })
        .select()
        .single()
      
      if (stepError) throw stepError

      // Save fields
      for (const [fieldIndex, field] of step.fields.entries()) {
        const { error: fieldError } = await supabase
          .from('form_fields')
          .upsert({
            id: field.id,
            step_id: savedStep.id,
            type: field.type,
            label: field.label,
            description: field.description,
            order_index: fieldIndex,
            is_required: field.required,
            is_conditional: field.conditions?.length > 0 || false,
            condition_logic: field.conditions ? { conditions: field.conditions } : {},
            options: field.options || {},
            validation_rules: field.validation || { type: 'none' },
            ui_options: {}
          })
        
        if (fieldError) throw fieldError
      }
    }

    router.push('/admin/forms')
  } catch (err) {
    const e = err as Error
    console.error('Error saving template:', e)
    error.value = e.message
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

    <div v-else>
      <!-- Template Settings -->
      <div class="card bg-base-100 shadow-xl mb-6">
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
      <JobFormBuilder
        v-model="template.steps"
        :metadata="template.meta || {}"
      />
    </div>
  </div>
</template> 