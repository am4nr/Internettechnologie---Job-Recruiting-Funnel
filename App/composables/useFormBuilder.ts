import { ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'
import type { FormTemplate, FormField } from '~/types/form'
import type { Json } from '~/types/database'

export function useFormBuilder() {
  const client = useSupabaseClient<Database>()
  const loading = ref(false)
  const error = ref<string | null>(null)

  const saveTemplate = async (templateData: FormTemplate, fields: FormField[]) => {
    try {
      loading.value = true
      error.value = null

      // Save the template with the fields in the schema
      const { error: templateError } = await client
        .from('form_templates')
        .upsert({
          id: templateData.id,
          title: templateData.title,
          description: templateData.description,
          type: templateData.type,
          is_active: templateData.is_active,
          schema: fields as unknown as Json,
          config: templateData.config || {},
          created_by: templateData.created_by,
          updated_at: new Date().toISOString()
        })

      if (templateError) throw templateError

      return templateData.id
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to save template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  const loadTemplate = async (templateId: string): Promise<FormTemplate> => {
    try {
      loading.value = true
      error.value = null

      const { data: template, error: templateError } = await client
        .from('form_templates')
        .select('*')
        .eq('id', templateId)
        .single()

      if (templateError) throw templateError
      if (!template) throw new Error('Template not found')

      // Cast the schema to FormField[] after verifying it's an array
      const schema = Array.isArray(template.schema) 
        ? (template.schema as Record<string, unknown>[]).map(field => ({
            id: String(field.id || crypto.randomUUID()),
            type: String(field.type || 'text'),
            name: String(field.name || field.id || crypto.randomUUID()),
            label: String(field.label || ''),
            validation: field.validation as string | undefined,
            placeholder: field.placeholder as string | undefined,
            options: field.options as { label: string, value: string }[] | undefined
          }))
        : []

      return {
        ...template,
        schema
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to load template'
      throw error.value
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    saveTemplate,
    loadTemplate
  }
} 