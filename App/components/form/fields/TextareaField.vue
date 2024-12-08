<!-- components/form/fields/TextareaField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: string
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>
    <textarea
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
      :class="[
        'textarea textarea-bordered',
        `textarea-${field.options?.size || 'md'}`,
        field.options?.color && `textarea-${field.options.color}`
      ]"
      :placeholder="field.options?.placeholder"
      :required="field.required"
      :rows="field.options?.rows || 4"
      :minlength="field.validation?.min"
      :maxlength="field.validation?.max"
    ></textarea>
    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>