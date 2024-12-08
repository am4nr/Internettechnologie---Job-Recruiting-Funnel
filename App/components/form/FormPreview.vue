<!-- components/form/FormPreview.vue -->
<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import type { FormField } from '~/types/form'

// Import field components
import TextField from './fields/TextField.vue'
import TextareaField from './fields/TextareaField.vue'
import SelectField from './fields/SelectField.vue'
import CheckboxField from './fields/CheckboxField.vue'
import RadioField from './fields/RadioField.vue'
import FileField from './fields/FileField.vue'
import RangeField from './fields/RangeField.vue'
import RatingField from './fields/RatingField.vue'
import ToggleField from './fields/ToggleField.vue'

// Map field types to components
const fieldComponents = {
  textField: TextField,
  textareaField: TextareaField,
  selectField: SelectField,
  checkboxField: CheckboxField,
  radioField: RadioField,
  fileField: FileField,
  rangeField: RangeField,
  ratingField: RatingField,
  toggleField: ToggleField
}

const props = defineProps<{
  modelValue: FormField
  activeTab: string
}>()

const emit = defineEmits<{
  'update:modelValue': (value: FormField) => void
  'update:tab': (value: string) => void
  save: () => void
  close: () => void
}>()

// Custom deep clone function
const deepClone = <T>(obj: T): T => {
  if (obj === null || typeof obj !== 'object') {
    return obj
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as unknown as T
  }

  const cloned: Record<string, any> = {}
  Object.entries(obj as Record<string, any>).forEach(([key, value]) => {
    cloned[key] = deepClone(value)
  })

  return cloned as T
}

// Track local state for preview
const localField = ref<FormField>(deepClone(props.modelValue))
const previewData = ref(getDefaultPreviewValue(props.modelValue.type))

const getDefaultPreviewValue = (type: string) => {
  switch(type) {
    case 'text':
      return localField.value.options?.placeholder || 'Example text'
    case 'textarea':
      return localField.value.options?.placeholder || 'Multi-line\ntext example'
    case 'select':
    case 'radio':
      return localField.value.options?.choices?.[0]?.value || 'Option 1'
    case 'checkbox':
      return Array.isArray(localField.value.options?.choices) ? 
        [localField.value.options.choices[0]?.value] : true
    case 'range':
      return (localField.value.options?.max || 100) / 2
    case 'rating':
      return Math.ceil((localField.value.options?.max || 5) / 2)
    case 'toggle':
      return true
    case 'file':
      return null
    default:
      return ''
  }
}

// Watch for model changes and update preview
watch(() => props.modelValue, (newVal) => {
  try {
    localField.value = deepClone(newVal)
    previewData.value = getDefaultPreviewValue(newVal.type)
  } catch (error) {
    console.error('Error updating preview:', error)
  }
}, { deep: true })

// Initialize field defaults and preview data
const initializeFieldDefaults = () => {
  if (!localField.value.options) {
    localField.value.options = {}
  }

  switch(localField.value.type) {
    case 'select':
    case 'radio':
    case 'checkbox':
      if (!localField.value.options.choices?.length) {
        localField.value.options.choices = [
          { label: 'Option 1', value: '1' },
          { label: 'Option 2', value: '2' }
        ]
      }
      break
    case 'range':
      localField.value.options.min ??= 0
      localField.value.options.max ??= 100
      localField.value.options.step ??= 1
      break
    case 'rating':
      localField.value.options.max ??= 5
      break
    case 'text':
    case 'textarea':
      localField.value.options.placeholder ??= 'Enter value...'
      break
  }
  
  // Update preview data after initializing defaults
  previewData.value = getDefaultPreviewValue(localField.value.type)
}

onMounted(() => {
  initializeFieldDefaults()
})
</script>

<template>
  <dialog class="modal" open>
    <div class="modal-box w-11/12 max-w-5xl">
      <h3 class="font-bold text-lg mb-4">
        Configure {{ localField.type }} Field
      </h3>

      <div class="space-y-4">
        <!-- Tabs -->
        <div class="tabs tabs-boxed">
          <a class="tab" 
             :class="{ 'tab-active': activeTab === 'options' }"
             @click="$emit('update:tab', 'options')">Options</a>
          <a class="tab" 
             :class="{ 'tab-active': activeTab === 'validation' }"
             @click="$emit('update:tab', 'validation')">Validation</a>
          <a class="tab" 
             :class="{ 'tab-active': activeTab === 'preview' }"
             @click="$emit('update:tab', 'preview')">Preview</a>
        </div>

        <!-- Options Tab -->
        <div v-if="activeTab === 'options'" class="space-y-4">
          <div class="form-control">
            <label class="label">Label</label>
            <input 
              v-model="localField.label"
              type="text"
              class="input input-bordered"
              @input="$emit('update:modelValue', localField)"
            />
          </div>

          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Required</span>
              <input 
                v-model="localField.required"
                type="checkbox"
                class="checkbox"
                @change="$emit('update:modelValue', localField)"
              />
            </label>
          </div>

          <!-- Field-specific Options -->
          <component
            :is="localField.type + 'Field'"
            :field="localField"
            :model-value="previewData"
            :preview="true"
            @update:model-value="previewData = $event"
          />
        </div>

        <!-- Validation Tab -->
        <div v-if="activeTab === 'validation'" class="space-y-4">
          <div class="form-control">
            <label class="label">Error Message</label>
            <input 
              v-model="localField.validation.message"
              type="text"
              class="input input-bordered"
              placeholder="Enter error message"
              @input="$emit('update:modelValue', localField)"
            />
          </div>

          <!-- Add field-specific validation options here -->
        </div>

        <!-- Preview Tab -->
        <div v-if="activeTab === 'preview'" class="space-y-4">
          <div class="card bg-base-100">
            <div class="card-body">
              <component
                :is="localField.type + 'Field'"
                :field="localField"
                :model-value="previewData"
                :preview="true"
                @update:model-value="previewData = $event"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="my-4">
        <h4 class="font-medium mb-2">Preview</h4>
        <component
          :is="fieldComponents[localField.type + 'Field']"
          :field="localField"
          :model-value="previewData"
          :preview="true"
          @update:model-value="previewData = $event"
        />
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" @click="$emit('save')">Save Changes</button>
        <button class="btn" @click="$emit('close')">Cancel</button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop" @click="$emit('close')">
      <button>close</button>
    </form>
  </dialog>
</template>