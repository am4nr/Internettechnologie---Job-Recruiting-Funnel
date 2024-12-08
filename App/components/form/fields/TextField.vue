<!-- components/form/fields/TextField.vue -->
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
    <input
      :type="field.options?.inputType || 'text'"
      :value="modelValue"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      :class="[
        'input input-bordered',
        `input-${field.options?.size || 'md'}`,
        field.options?.color && `input-${field.options.color}`
      ]"
      :placeholder="field.options?.placeholder"
      :required="field.required"
      :pattern="field.validation?.pattern"
      :minlength="field.validation?.min"
      :maxlength="field.validation?.max"
    />
    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>