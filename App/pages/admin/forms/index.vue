<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { FormTemplate } from '~/types/form'

definePageMeta({
  middleware: ['auth'],
  requiresRole: 'admin',
  layout: 'admin'
})

const supabase = useSupabaseClient()

// Ensure user is authenticated
const { data: { user } } = await supabase.auth.getUser()
if (!user) throw createError({ statusCode: 401, message: 'Unauthorized' })

const templates = ref<FormTemplate[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const fetchTemplates = async () => {
  if (!supabase) {
    console.error('Supabase client not initialized')
    return
  }

  try {
    loading.value = true
    const { data, error: fetchError } = await supabase
      .from('form_templates')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    templates.value = data as FormTemplate[] || []
  } catch (err) {
    const e = err as Error
    console.error('Error fetching templates:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const deleteTemplate = async (templateId: string) => {
  if (!confirm('Are you sure you want to delete this template?')) return

  try {
    const { error: deleteError } = await supabase
      .from('form_templates')
      .delete()
      .eq('id', templateId)

    if (deleteError) throw deleteError
    await fetchTemplates()
  } catch (err) {
    const e = err as Error
    console.error('Error deleting template:', e)
    error.value = e.message
  }
}

onMounted(() => {
  fetchTemplates()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Form Templates</h1>
      <NuxtLink to="/admin/forms/new" class="btn btn-primary">
        <i class="fas fa-plus mr-2"></i>
        Create Template
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!templates.length" class="text-center py-8">
      <h3 class="font-semibold mb-2">No Templates Found</h3>
      <p class="text-base-content/60 mb-4">Create your first form template to get started</p>
      <NuxtLink to="/admin/forms/new" class="btn btn-primary mt-4">
        Create Your First Template
      </NuxtLink>
    </div>

    <!-- Templates Grid -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="template in templates" 
           :key="template.id" 
           class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{{ template.title }}</h2>
          <p class="text-sm opacity-70">{{ template.description || 'No description' }}</p>
          <div class="badge" :class="{
            'badge-success': template.is_active,
            'badge-ghost': !template.is_active
          }">
            {{ template.is_active ? 'Active' : 'Inactive' }}
          </div>
          <div class="badge badge-neutral ml-2">
            {{ template.steps?.length || 0 }} steps
          </div>
          <div class="divider my-2"></div>
          <div class="flex gap-2 justify-end">
            <button 
              @click="() => deleteTemplate(template.id)"
              class="btn btn-ghost btn-sm text-error"
            >
              <i class="fas fa-trash"></i>
            </button>
            <NuxtLink :to="`/admin/forms/${template.id}`" class="btn btn-primary btn-sm">
              <i class="fas fa-edit mr-2"></i>
              Edit
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template> 