import type { FormTemplate, FormStep } from '~/types/form'

export const useFormSubmission = () => {
  const { supabase } = useSupabaseClient()
  const formData = ref<Record<string, any>>({})
  const currentStep = ref<number>(0)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const validateStep = (step: FormStep) => {
    const errors: Record<string, string> = {}
    
    step.fields.forEach(field => {
      const value = formData.value[field.id]
      
      if (field.required && !value) {
        errors[field.id] = 'This field is required'
      }

      if (field.validation) {
        if (field.validation.min && value < field.validation.min) {
          errors[field.id] = `Minimum value is ${field.validation.min}`
        }
        if (field.validation.max && value > field.validation.max) {
          errors[field.id] = `Maximum value is ${field.validation.max}`
        }
        if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
          errors[field.id] = field.validation.message || 'Invalid format'
        }
      }
    })

    return errors
  }

  const submitApplication = async (jobId: string, template: FormTemplate) => {
    try {
      loading.value = true
      
      // Create application
      const { data: application, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_id: jobId,
          user_id: auth.user?.id,
          status: 'pending',
          steps_data: formData.value,
          current_step: template.steps[0].title
        })
        .select()
        .single()

      if (applicationError) throw applicationError

      return application
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    formData,
    currentStep,
    loading,
    error,
    validateStep,
    submitApplication
  }
} 