<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { FormField, FormTemplate } from '~/types/form'
import { useFormTemplates } from '~/composables/useFormTemplates'
import { useToast } from '~/composables/useToast'

const props = defineProps<{
  modelValue: FormField[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: FormField[]]
}>()

const { getTemplates } = useFormTemplates()
const toast = useToast()

const templates = ref<FormTemplate[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Load active templates
const loadTemplates = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const result = await getTemplates({
      page_size: 100, // Load more templates since we're only showing active ones
      template_type: 'job_application'
    })
    
    // Filter for active templates only
    templates.value = result.data.filter(t => t.is_active)
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

const addTemplate = (templateId: string) => {
  const template = templates.value.find(t => t.id === templateId)
  if (template) {
    const newFields = [...props.modelValue, ...template.schema]
    emit('update:modelValue', newFields)
  }
}

// Load templates on mount
onMounted(loadTemplates)

const removeField = (fieldId: string) => {
  const newFields = props.modelValue.filter(field => field.id !== fieldId)
  emit('update:modelValue', newFields)
}

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'textarea', label: 'Text Area' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Phone' },
  { value: 'number', label: 'Number' },
  { value: 'select', label: 'Select' }
]

const validationRules = [
  { value: 'required', label: 'Required' },
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' }
]

const editingField = ref<FormField | null>(null)
const showFieldEditor = ref(false)

const parseOptions = (optionsText: string): { label: string, value: string }[] => {
  return optionsText.split('\n')
    .map(line => line.trim())
    .filter(line => line.includes('='))
    .map(line => {
      const [label, value] = line.split('=')
      return { label: label.trim(), value: value.trim() }
    })
}

const formatOptions = (options?: { label: string, value: string }[]): string => {
  if (!options) return ''
  return options.map(opt => `${opt.label}=${opt.value}`).join('\n')
}

const optionsText = ref('')

const addNewField = () => {
  const newField: FormField = {
    id: crypto.randomUUID(),
    type: 'text',
    name: '',
    label: '',
    validation: '',
    options: []
  }
  editingField.value = newField
  optionsText.value = ''
  showFieldEditor.value = true
}

const editField = (field: FormField) => {
  editingField.value = { ...field }
  optionsText.value = formatOptions(field.options)
  showFieldEditor.value = true
}

const saveField = () => {
  if (!editingField.value) return

  // Parse options if it's a select field
  if (editingField.value.type === 'select') {
    editingField.value.options = parseOptions(optionsText.value)
  } else {
    editingField.value.options = undefined
  }

  const newFields = [...props.modelValue]
  const index = newFields.findIndex(f => f.id === editingField.value?.id)
  
  if (index === -1) {
    // New field
    newFields.push(editingField.value)
  } else {
    // Update existing field
    newFields[index] = editingField.value
  }
  
  emit('update:modelValue', newFields)
  showFieldEditor.value = false
  editingField.value = null
}

const moveField = (fromIndex: number, toIndex: number) => {
  const newFields = [...props.modelValue]
  const [movedField] = newFields.splice(fromIndex, 1)
  newFields.splice(toIndex, 0, movedField)
  emit('update:modelValue', newFields)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Template Selection -->
    <div v-if="!isLoading && !error && templates.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div
        v-for="template in templates"
        :key="template.id"
        class="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
        @click="addTemplate(template.id)"
      >
        <div class="card-body">
          <h3 class="card-title">{{ template.title }}</h3>
          <p class="text-sm text-base-content/70">{{ template.description }}</p>
          <div class="text-xs text-base-content/60">
            {{ template.schema.length }} fields
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-else-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      <i class="fas fa-exclamation-circle" aria-hidden="true" />
      <span>{{ error }}</span>
      <button class="btn btn-sm btn-ghost" @click="loadTemplates">
        Try Again
      </button>
    </div>

    <!-- Current Form Fields -->
    <div v-if="modelValue.length > 0" class="mt-8">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">Current Form Fields</h3>
        <button class="btn btn-primary btn-sm" @click="addNewField">
          <i class="fas fa-plus" aria-hidden="true"></i>
          Add Field
        </button>
      </div>
      <div class="space-y-4">
        <div
          v-for="(field, index) in modelValue"
          :key="field.id"
          class="flex items-center justify-between p-4 bg-base-200 rounded-lg"
          draggable="true"
          @dragstart="e => e.dataTransfer?.setData('text/plain', index.toString())"
          @dragover.prevent
          @drop="e => {
            e.preventDefault()
            const fromIndex = parseInt(e.dataTransfer?.getData('text/plain') || '0')
            moveField(fromIndex, index)
          }"
        >
          <div class="flex-1">
            <p class="font-medium">{{ field.label }}</p>
            <p class="text-sm text-base-content/70">
              Type: {{ field.type }}
              <span v-if="field.validation" class="ml-2">
                ({{ field.validation }})
              </span>
            </p>
          </div>
          <div class="flex gap-2">
            <button
              class="btn btn-ghost btn-sm"
              @click="editField(field)"
              aria-label="Edit field"
            >
              <i class="fas fa-pencil" aria-hidden="true"></i>
            </button>
            <button
              class="btn btn-ghost btn-sm text-error"
              @click="removeField(field.id)"
              aria-label="Remove field"
            >
              <i class="fas fa-trash" aria-hidden="true"></i>
            </button>
            <button
              class="btn btn-ghost btn-sm cursor-move"
              aria-label="Drag to reorder"
            >
              <i class="fas fa-grip-vertical" aria-hidden="true"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Field Editor Modal -->
    <dialog :class="{ 'modal': true, 'modal-open': showFieldEditor }">
      <div class="modal-box">
        <h3 class="font-bold text-lg mb-4">
          {{ editingField ? (editingField.id ? 'Edit Field' : 'Add New Field') : '' }}
        </h3>
        
        <form v-if="editingField" @submit.prevent="saveField" class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Field Type</span>
            </label>
            <select v-model="editingField.type" class="select select-bordered w-full">
              <option v-for="type in fieldTypes" :key="type.value" :value="type.value">
                {{ type.label }}
              </option>
            </select>
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Field Name</span>
            </label>
            <input
              v-model="editingField.name"
              type="text"
              class="input input-bordered w-full"
              placeholder="Enter field name (e.g. full_name)"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Field Label</span>
            </label>
            <input
              v-model="editingField.label"
              type="text"
              class="input input-bordered w-full"
              placeholder="Enter field label (e.g. Full Name)"
            />
          </div>

          <div class="form-control">
            <label class="label">
              <span class="label-text">Validation Rules</span>
            </label>
            <select
              v-model="editingField.validation"
              class="select select-bordered w-full"
            >
              <option value="">None</option>
              <option v-for="rule in validationRules" :key="rule.value" :value="rule.value">
                {{ rule.label }}
              </option>
            </select>
          </div>

          <div v-if="editingField.type === 'select'" class="form-control">
            <label class="label">
              <span class="label-text">Options (one per line, format: label=value)</span>
            </label>
            <textarea
              v-model="optionsText"
              class="textarea textarea-bordered w-full h-24"
              placeholder="High School=high_school&#10;Bachelor's Degree=bachelors"
            ></textarea>
          </div>

          <div class="modal-action">
            <button type="button" class="btn" @click="showFieldEditor = false">
              Cancel
            </button>
            <button type="submit" class="btn btn-primary">
              Save Field
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" class="modal-backdrop">
        <button @click="showFieldEditor = false">Close</button>
      </form>
    </dialog>
  </div>
</template> 