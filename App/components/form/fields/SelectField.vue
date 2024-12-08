<!-- components/form/fields/SelectField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: string | string[]
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | string[]]
}>()

const handleChange = (event: Event) => {
  const select = event.target as HTMLSelectElement
  if (props.field.options?.multiple) {
    const values = Array.from(select.selectedOptions).map(opt => opt.value)
    emit('update:modelValue', values)
  } else {
    emit('update:modelValue', select.value)
  }
}
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>
    <select
      :value="modelValue"
      @change="handleChange"
      :class="[
        'select select-bordered',
        `select-${field.options?.size || 'md'}`,
        field.options?.color && `select-${field.options.color}`
      ]"
      :required="field.required"
      :multiple="field.options?.multiple"
    >
      <option value="" disabled selected>{{ field.options?.placeholder || 'Select...' }}</option>
      <option
        v-for="choice in field.options?.choices"
        :key="choice.value"
        :value="choice.value"
      >
        {{ choice.label }}
      </option>
    </select>
    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>