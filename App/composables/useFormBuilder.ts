import type { FormTemplate, FormStep, FormField } from '~/types/form'
import type { Database } from '~/types/database'

export const useFormBuilder = () => {
  const supabase = useSupabaseClient<Database>()
  const templates = ref<FormTemplate[]>([])
  const currentTemplate = ref<FormTemplate | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Load form templates
  const loadTemplates = async () => {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from('form_templates')
        .select(`
          id,
          title,
          description,
          is_active,
          meta,
          form_steps (
            id,
            title,
            description,
            order_index,
            is_conditional,
            condition_logic,
            form_fields (
              id,
              type,
              label,
              description,
              order_index,
              is_required,
              is_conditional,
              condition_logic,
              options,
              validation_rules,
              ui_options
            )
          )
        `)
        .order('created_at', { ascending: false })

      if (err) throw err

      templates.value = data.map(template => ({
        ...template,
        steps: template.form_steps.map(step => ({
          ...step,
          orderIndex: step.order_index,
          isConditional: step.is_conditional,
          conditionLogic: step.condition_logic,
          fields: step.form_fields.map(field => ({
            ...field,
            orderIndex: field.order_index,
            required: field.is_required,
            isConditional: field.is_conditional,
            conditionLogic: field.condition_logic,
            options: field.ui_options
          }))
        }))
      }))
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  // Save form template
  const saveTemplate = async (template: FormTemplate) => {
    try {
      loading.value = true
      
      // Insert/update template
      const { data: templateData, error: templateError } = await supabase
        .from('form_templates')
        .upsert({
          id: template.id,
          title: template.title,
          description: template.description,
          is_active: template.isActive,
          meta: template.meta
        })
        .select()
        .single()

      if (templateError) throw templateError

      // Save steps and fields
      for (const step of template.steps) {
        const { data: stepData, error: stepError } = await supabase
          .from('form_steps')
          .upsert({
            id: step.id,
            form_template_id: templateData.id,
            title: step.title,
            description: step.description,
            order_index: step.orderIndex,
            is_conditional: step.isConditional,
            condition_logic: step.conditionLogic
          })
          .select()
          .single()

        if (stepError) throw stepError

        // Save fields
        for (const field of step.fields) {
          const { error: fieldError } = await supabase
            .from('form_fields')
            .upsert({
              id: field.id,
              step_id: stepData.id,
              type: field.type,
              label: field.label,
              description: field.description,
              order_index: field.orderIndex,
              is_required: field.required,
              is_conditional: field.isConditional,
              condition_logic: field.conditionLogic,
              options: field.options,
              validation_rules: field.validation,
              ui_options: field.options
            })

          if (fieldError) throw fieldError
        }
      }

      await loadTemplates()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete template
  const deleteTemplate = async (templateId: string) => {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('form_templates')
        .delete()
        .eq('id', templateId)

      if (err) throw err
      await loadTemplates()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    templates,
    currentTemplate,
    loading,
    error,
    loadTemplates,
    saveTemplate,
    deleteTemplate
  }
} 