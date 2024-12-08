<!-- components/form/fields/FileField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: File | null
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: File | null]
  error: [message: string]
}>()

const error = ref<string | null>(null)
const progress = ref(0)
const previewUrl = ref<string | null>(null)

// File validation
const validateFile = (file: File): boolean => {
  // Size validation
  if (props.field.options?.maxSize) {
    const maxBytes = props.field.options.maxSize * 1024 * 1024 // Convert MB to bytes
    if (file.size > maxBytes) {
      error.value = `File size must be less than ${props.field.options.maxSize}MB`
      return false
    }
  }

  // Type validation
  if (props.field.options?.accept) {
    const allowedTypes = props.field.options.accept.split(',')
    if (!allowedTypes.some(type => file.type.match(type))) {
      error.value = `Invalid file type. Allowed: ${props.field.options.accept}`
      return false
    }
  }

  return true
}

// File change handler
const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  error.value = null
  previewUrl.value = null
  
  if (!file) {
    emit('update:modelValue', null)
    return
  }

  if (!validateFile(file)) {
    emit('error', error.value!)
    input.value = ''
    return
  }

  // Create preview for images
  if (file.type.startsWith('image/')) {
    previewUrl.value = URL.createObjectURL(file)
  }

  emit('update:modelValue', file)
}

// Cleanup on unmount
onBeforeUnmount(() => {
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
})
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>
    
    <div class="space-y-4">
      <input
        type="file"
        class="file-input file-input-bordered w-full"
        :class="{ 'file-input-error': error }"
        :accept="field.options?.accept"
        @change="handleFileChange"
        :required="field.required"
      />

      <!-- Preview -->
      <div v-if="modelValue || previewUrl" class="border rounded-lg p-4">
        <!-- Image preview -->
        <img
          v-if="previewUrl"
          :src="previewUrl"
          class="max-w-xs mx-auto rounded-lg"
          alt="File preview"
        />
        <!-- File info -->
        <div v-if="modelValue" class="text-sm opacity-70">
          <p>{{ modelValue.name }}</p>
          <p>{{ (modelValue.size / 1024).toFixed(1) }}KB</p>
        </div>
      </div>

      <!-- Progress bar -->
      <progress
        v-if="progress > 0 && progress < 100"
        class="progress progress-primary w-full"
        :value="progress"
        max="100"
      ></progress>

      <!-- Error message -->
      <label v-if="error || field.validation?.message" class="label">
        <span class="label-text-alt text-error">{{ error || field.validation?.message }}</span>
      </label>
    </div>
  </div>
</template>