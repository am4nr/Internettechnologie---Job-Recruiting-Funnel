import { ref, computed } from 'vue'
import type { FormField, FormFieldType, FormFieldCondition, StepCondition, ApplicationStep } from '~/types/form'

export const useConditions = (steps: Ref<ApplicationStep[]>) => {
  // Get all available fields up to a specific step index
  const getAvailableFields = (currentStepIndex: number, currentFieldIndex = -1) => {
    if (!steps.value) return []

    return steps.value
      .slice(0, currentStepIndex + 1) // Include current step for field conditions
      .flatMap((step, stepIndex) => {
        // For the current step, only include fields before the current field
        const fields = stepIndex === currentStepIndex && currentFieldIndex >= 0
          ? step.fields.slice(0, currentFieldIndex)
          : step.fields

        return fields.map(field => ({
          id: field.id,
          label: field.label,
          type: field.type,
          stepTitle: step.title,
          options: field.options
        }))
      })
  }

  // Get options for a field's value selection
  const getFieldOptions = (fieldId: string) => {
    const field = steps.value
      .flatMap(s => s.fields)
      .find(f => f.id === fieldId)

    if (!field) return []

    switch (field.type) {
      case 'select':
      case 'radio':
        return field.options || []
      case 'checkbox':
        return [
          { value: 'true', label: 'Checked' },
          { value: 'false', label: 'Unchecked' }
        ]
      default:
        return []
    }
  }

  // Check if a field has fixed options
  const hasFixedOptions = (fieldType?: FormFieldType) => {
    return ['select', 'radio', 'checkbox'].includes(fieldType || '')
  }

  // Add a new condition
  const addCondition = <T extends FormFieldCondition | StepCondition>(conditions: T[]) => {
    conditions.push({
      field: '',
      operator: 'equals',
      value: ''
    } as T)
  }

  // Remove a condition
  const removeCondition = <T extends FormFieldCondition | StepCondition>(
    conditions: T[],
    index: number
  ) => {
    conditions.splice(index, 1)
  }

  // Evaluate conditions in preview mode
  const evaluateConditions = (
    conditions: (FormFieldCondition | StepCondition)[] | undefined,
    formValues: Record<string, any>,
    currentStepIndex: number
  ): boolean => {
    if (!conditions?.length) return true

    return conditions.every(condition => {
      const field = getAvailableFields(currentStepIndex)
        .find(f => f.id === condition.field)
      if (!field) return true

      const fieldValue = formValues[condition.field]
      
      switch (condition.operator) {
        case 'equals':
          return fieldValue === condition.value
        case 'not_equals':
          return fieldValue !== condition.value
        case 'greater_than':
          return Number(fieldValue) > Number(condition.value)
        case 'less_than':
          return Number(fieldValue) < Number(condition.value)
        case 'contains':
          return String(fieldValue).includes(String(condition.value))
        case 'not_contains':
          return !String(fieldValue).includes(String(condition.value))
        case 'is_empty':
          return !fieldValue || fieldValue === ''
        case 'is_not_empty':
          return fieldValue && fieldValue !== ''
        default:
          return true
      }
    })
  }

  return {
    getAvailableFields,
    getFieldOptions,
    hasFixedOptions,
    addCondition,
    removeCondition,
    evaluateConditions
  }
} 