<!-- components/form/fields/RangeField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: number
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const displayValue = computed(() => {
  if (typeof props.modelValue !== 'number') return ''
  return props.field.options?.valueFormat 
    ? props.field.options.valueFormat(props.modelValue)
    : props.modelValue
})
</script>

<template>
  <div class="form-control">
    <div class="flex justify-between">
      <label v-if="!preview" class="label">
        {{ field.label }}
        <span v-if="field.required" class="text-error">*</span>
      </label>
      <span class="label-text-alt">{{ displayValue }}</span>
    </div>

    <div class="flex items-center gap-4">
      <span class="text-sm">{{ field.options?.min || 0 }}</span>
      <input
        type="range"
        :value="modelValue"
        @input="emit('update:modelValue', +($event.target as HTMLInputElement).value)"
        :class="[
          'range',
          `range-${field.options?.size || 'md'}`,
          field.options?.color && `range-${field.options.color}`
        ]"
        :min="field.options?.min"
        :max="field.options?.max"
        :step="field.options?.step || 1"
        :required="field.required"
      />
      <span class="text-sm">{{ field.options?.max || 100 }}</span>
    </div>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>