<!-- components/jobs/JobFormBuilder.vue -->
<script setup lang="ts">
import type { ApplicationStep } from '~/types/jobs'
import type { FormField, FormFieldType } from '~/types/form'
import { VueDraggableNext } from 'vue-draggable-next'
import FormFieldComponent from '~/components/form/FormField.vue'
import FormPreview from '~/components/form/FormPreview.vue'
import BaseFormField from '~/components/form/FormField.vue'

// Field type definitions with their DaisyUI options
const fieldTypes = [
  { 
    value: 'text' as const, 
    label: 'Text Input',
    description: 'Single line text input',
    icon: 'fa-keyboard',
    component: 'BaseInput',
    options: {
      placeholder: '',
      size: 'md' as const,
      bordered: true,
      variant: 'primary' as const
    }
  },
  { 
    value: 'textarea' as const, 
    label: 'Text Area',
    description: 'Multi-line text input',
    icon: 'fa-paragraph',
    component: 'BaseTextarea',
    options: {
      placeholder: '',
      rows: 4,
      bordered: true
    }
  },
  { 
    value: 'select' as const, 
    label: 'Select',
    description: 'Dropdown selection',
    icon: 'fa-list',
    component: 'BaseSelect',
    options: {
      placeholder: '',
      size: 'md' as const,
      bordered: true,
      choices: [] as { label: string; value: string | number }[]
    }
  },
  { 
    value: 'checkbox' as const, 
    label: 'Checkbox',
    description: 'Multiple choice selection',
    icon: 'fa-check-square',
    component: 'BaseCheckbox',
    options: {
      size: 'md' as const,
      variant: 'primary' as const
    }
  },
  { 
    value: 'radio' as const, 
    label: 'Radio',
    description: 'Single choice selection',
    icon: 'fa-circle',
    component: 'BaseRadio',
    options: {
      size: 'md' as const,
      choices: [] as { label: string; value: string | number }[]
    }
  },
  { 
    value: 'file' as const, 
    label: 'File Upload',
    description: 'File attachment field',
    icon: 'fa-upload',
    component: 'BaseFileUpload',
    options: {
      accept: '',
      maxSize: 5242880,
      multiple: false
    }
  },
  { 
    value: 'range' as const, 
    label: 'Range',
    description: 'Numeric range slider',
    icon: 'fa-sliders-h',
    component: 'BaseRange',
    options: {
      min: 0,
      max: 100,
      step: 1,
      variant: 'primary' as const
    }
  },
  { 
    value: 'toggle' as const, 
    label: 'Toggle',
    description: 'On/off switch',
    icon: 'fa-toggle-on',
    component: 'BaseToggle',
    options: {
      size: 'md' as const,
      variant: 'primary' as const
    }
  }
] as const

const props = defineProps<{
  modelValue: ApplicationStep[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ApplicationStep[]]
}>()

const steps = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const activeStep = ref(0)
const editingField = ref<FormField | null>(null)
const isPreviewMode = ref(false)
const isDragging = ref(false)
const isEditModalOpen = ref(false)
const formErrors = ref<Record<string, string[]>>({})
const formValues = ref<Record<string, any>>({})
const previewValues = ref<Record<string, any>>({})

// Validate step
const validateStep = (step: ApplicationStep) => {
  const errors: string[] = []
  
  if (!step.title?.trim()) {
    errors.push('Step title is required')
  }

  if (!step.fields?.length) {
    errors.push('At least one field is required')
  }

  step.fields?.forEach(field => {
    if (field.required && !formValues.value[field.id]) {
      errors.push(`${field.label} is required`)
    }

    if (field.validation?.type !== 'none') {
      const value = formValues.value[field.id]
      switch (field.validation?.type) {
        case 'email':
          if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
            errors.push(`${field.label} must be a valid email`)
          }
          break
        case 'phone':
          if (value && !/^\+?[\d\s-]{10,}$/.test(value)) {
            errors.push(`${field.label} must be a valid phone number`)
          }
          break
        case 'github_url':
          if (value && !/^https:\/\/github\.com\/[^\/]+\/?$/.test(value)) {
            errors.push(`${field.label} must be a valid GitHub profile URL`)
          }
          break
        case 'linkedin':
          if (value && !/^https:\/\/[^\/]*linkedin\.com\/.*$/.test(value)) {
            errors.push(`${field.label} must be a valid LinkedIn URL`)
          }
          break
        case 'twitter':
          if (value && !/^https:\/\/[^\/]*twitter\.com\/[^\/]+\/?$/.test(value)) {
            errors.push(`${field.label} must be a valid Twitter URL`)
          }
          break
        case 'website':
          if (value && !/^https?:\/\/.*$/.test(value)) {
            errors.push(`${field.label} must be a valid URL`)
          }
          break
      }
      
      // Check min/max if defined
      if (field.validation.min !== undefined && value < field.validation.min) {
        errors.push(`${field.label} must be at least ${field.validation.min}`)
      }
      if (field.validation.max !== undefined && value > field.validation.max) {
        errors.push(`${field.label} must be at most ${field.validation.max}`)
      }
      
      // Check custom pattern if defined
      if (field.validation.pattern && !new RegExp(field.validation.pattern).test(value)) {
        errors.push(field.validation.message || `${field.label} is invalid`)
      }
    }
  })

  return errors
}

// Navigation
const canGoNext = computed(() => {
  if (!steps.value?.[activeStep.value]) return false
  return activeStep.value < steps.value.length - 1 && !validateStep(steps.value[activeStep.value]).length
})

const canGoPrevious = computed(() => activeStep.value > 0)

const goToNextStep = () => {
  if (canGoNext.value) {
    activeStep.value++
  }
}

const goToPreviousStep = () => {
  if (canGoPrevious.value) {
    activeStep.value--
  }
}

const handleFieldChange = (field: FormField, value: any) => {
  formValues.value[field.id] = value
  // Clear previous errors for this field
  if (formErrors.value[field.id]) {
    delete formErrors.value[field.id]
  }
}

// Preview mode helpers
const isFieldVisible = () => true

// Debug watch
watch(() => steps.value?.[activeStep.value]?.fields, (newFields) => {
  console.log('Fields changed:', newFields)
}, { deep: true })

// Debug computed
const currentFields = computed(() => {
  const fields = steps.value?.[activeStep.value]?.fields || []
  console.log('Current fields computed:', fields)
  return fields
})

// Handle field reordering
const handleFieldReorder = (reorderedFields: FormField[]) => {
  if (!steps.value?.[activeStep.value]) return
  steps.value[activeStep.value].fields = reorderedFields.map((field, index) => ({
    ...field,
    orderIndex: index
  }))
}

// Add field by clicking
const addField = (type: typeof fieldTypes[number]) => {
  if (!steps.value?.[activeStep.value]) {
    console.error('No active step found')
    return
  }

  const fieldType = fieldTypes.find(t => t.value === type.value)
  if (!fieldType) {
    console.error('Field type not found:', type.value)
    return
  }

  const newField: FormField = {
    id: crypto.randomUUID(),
    type: type.value,
    label: `New ${fieldType.label}`,
    description: '',
    required: false,
    orderIndex: steps.value[activeStep.value].fields.length,
    options: { ...type.options },
    validation: { type: 'none' }
  }

  console.log('Adding new field:', newField)
  
  // Create a new array reference to trigger reactivity
  const updatedFields = [...steps.value[activeStep.value].fields, newField]
  steps.value[activeStep.value].fields = updatedFields
  
  console.log('Updated fields array:', steps.value[activeStep.value].fields)
}

const removeField = (field: FormField) => {
  if (!steps.value[activeStep.value]) return
  
  const index = steps.value[activeStep.value].fields.findIndex(f => f.id === field.id)
  if (index === -1) return

  steps.value[activeStep.value].fields.splice(index, 1)
  steps.value[activeStep.value].fields.forEach((field, i) => {
    field.orderIndex = i
  })
}

const moveFieldUp = (field: FormField) => {
  if (!steps.value?.[activeStep.value]) return
  const fields = steps.value[activeStep.value].fields
  const index = fields.findIndex(f => f.id === field.id)
  if (index <= 0) return // Already at the top

  // Swap with previous field
  const newFields = [...fields]
  const temp = newFields[index]
  newFields[index] = newFields[index - 1]
  newFields[index - 1] = temp

  // Update orderIndex values
  steps.value[activeStep.value].fields = newFields.map((f, i) => ({
    ...f,
    orderIndex: i
  }))
}

const moveFieldDown = (field: FormField) => {
  if (!steps.value?.[activeStep.value]) return
  const fields = steps.value[activeStep.value].fields
  const index = fields.findIndex(f => f.id === field.id)
  if (index === -1 || index >= fields.length - 1) return // Already at the bottom

  // Swap with next field
  const newFields = [...fields]
  const temp = newFields[index]
  newFields[index] = newFields[index + 1]
  newFields[index + 1] = temp

  // Update orderIndex values
  steps.value[activeStep.value].fields = newFields.map((f, i) => ({
    ...f,
    orderIndex: i
  }))
}

// Add these types
type Condition = {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
  value: string | number | boolean
}

type StepCondition = {
  stepId: string
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
  value: string | number | boolean
}

// Add to the editField function initialization
const editField = (field: FormField) => {
  editingField.value = {
    ...field,
    options: {
      ...field.options,
      choices: [...(field.options?.choices || [])],
      placeholder: field.options?.placeholder || '',
      accept: field.options?.accept || '',
      multiple: field.options?.multiple || false,
      min: field.options?.min ?? 0,
      max: field.options?.max ?? 100,
      step: field.options?.step ?? 1
    },
    validation: {
      ...field.validation,
      type: field.validation?.type || 'none',
      pattern: field.validation?.pattern || '',
      message: field.validation?.message || ''
    },
    conditions: field.conditions || []
  }
  isEditModalOpen.value = true
}

// Add these helper functions
const getAvailableFields = (currentField: FormField) => {
  if (!steps.value?.[activeStep.value]) return []
  
  // Get all fields that come before this one in the current step
  const currentIndex = steps.value[activeStep.value].fields.findIndex(f => f.id === currentField.id)
  const currentStepFields = steps.value[activeStep.value].fields
    .slice(0, currentIndex)
    .map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      stepId: steps.value[activeStep.value].id
    }))

  // Get all fields from previous steps
  const previousStepFields = steps.value
    .slice(0, activeStep.value)
    .flatMap(step => step.fields.map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      stepId: step.id
    })))

  return [...previousStepFields, ...currentStepFields]
}

const getAvailableFieldsForStep = (step: ApplicationStep) => {
  if (!steps.value) return []
  
  // Get all fields from previous steps
  const stepIndex = steps.value.findIndex(s => s.id === step.id)
  if (stepIndex === -1) return []

  return steps.value
    .slice(0, stepIndex)
    .flatMap(s => s.fields.map(f => ({
      id: f.id,
      label: f.label,
      type: f.type,
      stepTitle: s.title
    })))
}

const getOperatorsForType = (fieldType: FormFieldType) => {
  switch (fieldType) {
    case 'text':
    case 'textarea':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' },
        { value: 'contains', label: 'Contains' },
        { value: 'notContains', label: 'Does Not Contain' }
      ]
    case 'number':
    case 'range':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' },
        { value: 'greaterThan', label: 'Greater Than' },
        { value: 'lessThan', label: 'Less Than' }
      ]
    case 'checkbox':
    case 'toggle':
      return [
        { value: 'equals', label: 'Is Checked' },
        { value: 'notEquals', label: 'Is Not Checked' }
      ]
    case 'select':
    case 'radio':
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' }
      ]
    default:
      return [
        { value: 'equals', label: 'Equals' },
        { value: 'notEquals', label: 'Not Equals' }
      ]
  }
}

const addFieldCondition = (field: FormField) => {
  if (!field.conditions) {
    field.conditions = []
  }
  field.conditions.push({
    field: '',
    operator: 'equals',
    value: ''
  })
}

const removeFieldCondition = (field: FormField, index: number) => {
  field.conditions?.splice(index, 1)
}

const addStepCondition = (step: ApplicationStep) => {
  if (!step.conditions) {
    step.conditions = []
  }
  step.conditions.push({
    field: '',
    operator: 'equals',
    value: ''
  })
}

const removeStepCondition = (step: ApplicationStep, index: number) => {
  step.conditions?.splice(index, 1)
}

// Add these options
const sizeOptions = [
  { value: 'xs', label: 'Extra Small' },
  { value: 'sm', label: 'Small' },
  { value: 'md', label: 'Medium' },
  { value: 'lg', label: 'Large' }
] as const

const colorVariants = [
  { value: 'primary', label: 'Primary' },
  { value: 'secondary', label: 'Secondary' },
  { value: 'accent', label: 'Accent' },
  { value: 'info', label: 'Info' },
  { value: 'success', label: 'Success' },
  { value: 'warning', label: 'Warning' },
  { value: 'error', label: 'Error' },
  { value: 'ghost', label: 'Ghost' }
] as const

const closeModal = () => {
  isEditModalOpen.value = false
  editingField.value = null
}

const openFieldSettings = (field: FormField) => {
  editingField.value = { ...field }  // Create a copy to avoid direct mutation
  isEditModalOpen.value = true
}

const saveFieldEdit = () => {
  if (!editingField.value || !steps.value?.[activeStep.value]) return
  
  const index = steps.value[activeStep.value].fields.findIndex(f => f.id === editingField.value?.id)
  if (index === -1) return

  steps.value[activeStep.value].fields[index] = { ...editingField.value }
  closeModal()
}

// Step visibility logic
const isStepVisible = (step: ApplicationStep, stepIndex: number) => {
  return true
}

const editingStep = ref<ApplicationStep | null>(null)
const isStepSettingsOpen = ref(false)

const openStepSettings = (step: ApplicationStep) => {
  // Deep copy to avoid reference issues
  editingStep.value = JSON.parse(JSON.stringify(step))
  if (!editingStep.value.conditions) {
    editingStep.value.conditions = []
  }
  isStepSettingsOpen.value = true
}

const closeStepSettings = () => {
  isStepSettingsOpen.value = false
  editingStep.value = null
  // Remove any lingering modal-related classes from the body
  document.body.classList.remove('modal-open')
}

const saveStepSettings = () => {
  if (!editingStep.value) return
  
  const index = steps.value.findIndex(s => s.id === editingStep.value?.id)
  if (index === -1) return

  // Deep copy to avoid reference issues
  steps.value[index] = JSON.parse(JSON.stringify(editingStep.value))
  closeStepSettings()
}

// Watch for escape key to close modal
onMounted(() => {
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isStepSettingsOpen.value) {
      closeStepSettings()
    }
  }
  window.addEventListener('keydown', handleEscape)
  
  onUnmounted(() => {
    window.removeEventListener('keydown', handleEscape)
    // Ensure cleanup when component is destroyed
    closeStepSettings()
  })
})

const getFieldValueInput = (condition: StepCondition, field: { id: string; type: FormFieldType; label: string }) => {
  const fieldInStep = steps.value
    .flatMap(s => s.fields)
    .find(f => f.id === field.id)

  switch (field.type) {
    case 'select':
    case 'radio':
      return fieldInStep?.options?.map(opt => ({
        value: opt.value,
        label: opt.label
      })) || []
    case 'checkbox':
      return [
        { value: 'true', label: 'Checked' },
        { value: 'false', label: 'Unchecked' }
      ]
    default:
      return []
  }
}

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

const hasFixedOptions = (fieldType?: FormFieldType) => {
  return ['select', 'radio', 'checkbox'].includes(fieldType || '')
}

// Add validation helper functions
const addValidation = (field: FormField) => {
  if (!field.validation) {
    field.validation = []
  }
  field.validation.push({
    type: 'email',
    message: ''
  })
}

const removeValidation = (field: FormField, index: number) => {
  field.validation?.splice(index, 1)
}

const getValidationOptions = (fieldType: FormFieldType): { value: ValidationRule; label: string }[] => {
  if (fieldType === 'text') {
    return [
      { value: 'none', label: 'None' },
      { value: 'email', label: 'Email Address' },
      { value: 'phone', label: 'Phone Number' },
      { value: 'github_url', label: 'GitHub Profile URL' },
      { value: 'linkedin', label: 'LinkedIn URL' },
      { value: 'twitter', label: 'Twitter Username' },
      { value: 'website', label: 'Website URL' }
    ]
  }
  return []
}

// Update validation function
const validateField = (field: FormField, value: any): string[] => {
  const errors: string[] = []

  // Handle required field validation
  if (field.required) {
    if (field.type === 'checkbox' || field.type === 'toggle') {
      if (!value) {
        errors.push(`${field.label} must be checked`)
      }
    } else if (field.type === 'file') {
      if (!value || (Array.isArray(value) && value.length === 0)) {
        errors.push(`${field.label} is required`)
      }
    } else {
      if (value === undefined || value === null || value === '') {
        errors.push(`${field.label} is required`)
      }
    }
  }

  // Skip format validation if field is empty and not required
  if (!field.required && (value === undefined || value === null || value === '')) {
    return errors
  }

  // Handle format validation
  if (field.validation !== 'none' && value) {
    switch (field.validation) {
      case 'email':
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errors.push('Please enter a valid email address')
        }
        break
      case 'phone':
        // Allows formats like: +1 (123) 456-7890, 123-456-7890, 1234567890
        if (!/^(\+\d{1,3}\s?)?([\s-.]?\d{3}[\s-.]?\d{3}[\s-.]?\d{4})$/.test(value)) {
          errors.push('Please enter a valid phone number')
        }
        break
      case 'github_url':
        // GitHub profile URLs: github.com/username
        if (!/^(https?:\/\/)?(www\.)?github\.com\/[\w-]+\/?$/.test(value)) {
          errors.push('Please enter a valid GitHub profile URL (e.g., github.com/username)')
        }
        break
      case 'linkedin':
        // LinkedIn URLs: linkedin.com/in/username
        if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[\w-]+\/?$/.test(value)) {
          errors.push('Please enter a valid LinkedIn profile URL')
        }
        break
      case 'twitter':
        // Twitter usernames: letters, numbers, underscores, max 15 chars
        if (!/^@?(\w){1,15}$/.test(value)) {
          errors.push('Please enter a valid Twitter username')
        }
        break
      case 'website':
        try {
          new URL(value.startsWith('http') ? value : `https://${value}`)
        } catch {
          errors.push('Please enter a valid website URL')
        }
        break
    }
  }

  return errors
}

const addStep = () => {
  const newStep: ApplicationStep = {
    id: crypto.randomUUID(),
    title: 'New Step',
    description: '',
    fields: [],
    orderIndex: steps.value.length
  }
  steps.value.push(newStep)
  activeStep.value = steps.value.length - 1
}

const removeStep = (index: number) => {
  if (steps.value.length <= 1) return // Don't delete the last step
  
  // Remove the step
  steps.value.splice(index, 1)
  
  // Update orderIndex for remaining steps
  steps.value.forEach((step, i) => {
    step.orderIndex = i
  })
  
  // Adjust activeStep if needed
  if (activeStep.value >= steps.value.length) {
    activeStep.value = steps.value.length - 1
  }
}

// Get preview value for a field
const getPreviewValue = (field: FormField) => {
  if (!field) return null
  
  if (previewValues.value[field.id]) {
    return previewValues.value[field.id]
  }

  // Set initial preview value based on field type
  const value = (() => {
    switch(field.type) {
      case 'text':
        return field.options?.placeholder || 'Sample text'
      case 'textarea':
        return field.options?.placeholder || 'Sample text\nNew line'
      case 'select':
      case 'radio':
        return field.options?.choices?.[0]?.value || ''
      case 'checkbox':
        return field.options?.choices?.[0]?.value || false
      case 'range':
        return (field.options?.max || 100) / 2
      case 'rating':
        return Math.ceil((field.options?.max || 5) / 2)
      case 'toggle':
        return true
      case 'file':
        return null
      default:
        return ''
    }
  })()

  previewValues.value[field.id] = value
  return value
}
</script>

<template>
  <div class="space-y-6">
    <!-- Preview Mode Toggle -->
    <div class="flex justify-end mb-4">
      <label class="label cursor-pointer gap-2">
        <span class="label-text">Preview Mode</span>
        <input
          v-model="isPreviewMode"
          type="checkbox"
          class="toggle toggle-primary"
        />
      </label>
    </div>

    <!-- Steps Progress -->
    <ul class="steps w-full mb-8">
      <li
        v-for="(step, index) in steps"
        :key="step.id"
        class="step"
        :class="{
          'step-primary': index <= activeStep,
          'cursor-pointer': !isPreviewMode
        }"
        @click="!isPreviewMode && (activeStep = index)"
      >
        {{ step.title }}
      </li>
      <!-- Add Step Button -->
      <li 
        v-if="!isPreviewMode"
        class="step cursor-pointer opacity-50 hover:opacity-80 transition-opacity"
        @click="addStep"
      >
        <span class="flex items-center gap-2">
          <i class="fas fa-plus"></i>
          Add Step
        </span>
      </li>
    </ul>

    <!-- Active Step Content -->
    <div v-if="steps[activeStep]" class="space-y-6">
      <!-- Step Settings -->
      <div class="card bg-base-200">
        <div class="card-body">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold text-lg">Step Configuration</h3>
            <button
              v-if="steps.length > 1"
              @click.prevent="removeStep(activeStep)"
              class="btn btn-ghost btn-sm text-error"
            >
              <i class="fas fa-trash mr-2"></i>
              Delete Step
            </button>
          </div>
          <div class="grid gap-4">
            <div class="form-control">
              <label class="label">
                <span class="label-text">Step Title</span>
              </label>
              <input
                v-model="steps[activeStep].title"
                type="text"
                class="input input-bordered"
                placeholder="Enter step title"
              />
            </div>

            <div class="form-control">
              <label class="label">
                <span class="label-text">Step Description</span>
              </label>
              <textarea
                v-model="steps[activeStep].description"
                class="textarea textarea-bordered"
                placeholder="Enter step description"
                rows="2"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Form Builder Area -->
      <div v-if="!isPreviewMode">
        <!-- Elements Toolbar -->
        <div class="bg-base-200 rounded-lg p-4 mb-6">
          <div class="flex items-center justify-between mb-2">
            <h3 class="font-bold">Elements</h3>
            <span class="text-sm text-base-content/60">Click to add to form</span>
          </div>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="type in fieldTypes"
              :key="type.value"
              type="button"
              class="btn btn-ghost gap-2"
              @click="addField(type)"
            >
              <i :class="['fas', type.icon, 'text-primary']"></i>
              {{ type.label }}
            </button>
          </div>
        </div>

        <!-- Form Fields Container -->
        <div class="bg-base-200 rounded-lg p-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="font-bold">Form Fields</h3>
            <div class="text-sm text-base-content/60">
              {{ currentFields.length }} fields
            </div>
          </div>

          <!-- Field List -->
          <div v-if="currentFields.length > 0">
            <TransitionGroup name="field-move" tag="div" class="space-y-3">
              <div
                v-for="field in currentFields"
                :key="field.id"
                class="bg-base-100 rounded-lg p-4 flex items-start gap-4 field-item"
                :class="{ 'border-2 border-primary': editingField?.id === field.id }"
              >
                <!-- Move Up/Down Buttons -->
                <div class="flex flex-col gap-1">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs px-1"
                    :disabled="field.orderIndex === 0"
                    @click="moveFieldUp(field)"
                  >
                    <i class="fas fa-chevron-up"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs px-1"
                    :disabled="field.orderIndex === currentFields.length - 1"
                    @click="moveFieldDown(field)"
                  >
                    <i class="fas fa-chevron-down"></i>
                  </button>
                </div>

                <!-- Field Info -->
                <div class="flex-1">
                  <div class="flex items-center gap-3 mb-1">
                    <i :class="['fas', fieldTypes.find(t => t.value === field.type)?.icon, 'text-primary']"></i>
                    <span class="font-medium">{{ field.label }}</span>
                  </div>
                  <div class="text-sm text-base-content/60">
                    {{ fieldTypes.find(t => t.value === field.type)?.description }}
                  </div>
                  <div class="flex gap-2 mt-2">
                    <span v-if="field.required" class="badge badge-sm badge-primary">Required</span>
                    <span v-if="field.options?.choices?.length" class="badge badge-sm badge-accent">
                      {{ field.options.choices.length }} Options
                    </span>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex gap-2">
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm"
                    :class="{ 'btn-primary': editingField?.id === field.id }"
                    @click="editField(field)"
                  >
                    <i class="fas fa-edit"></i>
                  </button>
                  <button
                    type="button"
                    class="btn btn-ghost btn-sm text-error"
                    @click="removeField(field)"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </TransitionGroup>
          </div>

          <!-- Empty State -->
          <div 
            v-else
            class="text-center py-12 text-base-content/60 bg-base-100 rounded-lg border-2 border-dashed"
          >
            <p>Click elements above to add them here</p>
          </div>
        </div>
      </div>

      <!-- Preview Mode -->
      <div v-else class="max-w-2xl mx-auto">
        <div class="card bg-base-100 shadow-lg">
          <div class="card-body">
            <h2 class="card-title mb-4">{{ steps[activeStep].title }}</h2>
            <p v-if="steps[activeStep].description" class="mb-6 text-base-content/70">
              {{ steps[activeStep].description }}
            </p>

            <!-- Form Fields -->
            <div class="space-y-6">
              <div
                v-for="field in steps[activeStep].fields"
                :key="field.id"
                class="form-control"
              >
                <BaseFormField
                  :field="field"
                  :component="fieldTypes.find(t => t.value === field.type)?.component"
                  :preview="true"
                  :model-value="getPreviewValue(field)"
                  @update:model-value="(val) => previewValues[field.id] = val"
                />
              </div>
            </div>

            <!-- Navigation -->
            <div class="flex justify-between mt-6">
              <button
                v-if="activeStep > 0"
                @click.prevent="activeStep--"
                class="btn btn-ghost"
              >
                <i class="fas fa-arrow-left mr-2"></i>
                Previous
              </button>
              <button
                v-if="activeStep < steps.length - 1"
                @click.prevent="activeStep++"
                class="btn btn-primary ml-auto"
              >
                Next
                <i class="fas fa-arrow-right ml-2"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Edit Modal -->
    <dialog :open="isEditModalOpen" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">Edit Field</h3>
        
        <form v-if="editingField" @submit.prevent="saveFieldEdit" class="space-y-4">
          <!-- Field Edit Form Content -->
          <div class="form-control">
            <label class="label">
              <span class="label-text">Label</span>
            </label>
            <input
              type="text"
              v-model="editingField.label"
              class="input input-bordered w-full"
              required
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Description</span>
            </label>
            <textarea
              v-model="editingField.description"
              class="textarea textarea-bordered w-full"
              rows="2"
            ></textarea>
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Required Field</span>
              <input
                type="checkbox"
                v-model="editingField.required"
                class="toggle toggle-primary"
              />
            </label>
          </div>

          <!-- Field Type Specific Options -->
          <div v-if="['text', 'textarea'].includes(editingField.type)" class="form-control">
            <label class="label">
              <span class="label-text">Placeholder</span>
            </label>
            <input
              type="text"
              v-model="editingField.options.placeholder"
              class="input input-bordered w-full"
              placeholder="Enter placeholder text"
            />
          </div>

          <div class="modal-action">
            <button type="button" class="btn" @click="closeModal">Cancel</button>
            <button type="submit" class="btn btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop" @click="closeModal">
        <button>close</button>
      </form>
    </dialog>
  </div>
</template>

<style scoped>
.field-move-move {
  transition: transform 0.4s ease;
}

.field-move-enter-active,
.field-move-leave-active {
  transition: all 0.4s ease;
}

.field-move-enter-from,
.field-move-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.field-item {
  transition: all 0.4s ease;
  backface-visibility: hidden;
}
</style>