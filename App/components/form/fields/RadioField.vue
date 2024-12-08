<!-- components/form/fields/RadioField.vue -->
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

const layout = computed(() => props.field.options?.layout || 'stacked')
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>
    
    <div :class="[
      'space-y-2',
      layout === 'inline' && 'flex flex-wrap gap-4 space-y-0'
    ]">
      <label 
        v-for="choice in field.options?.choices"
        :key="choice.value"
        class="label cursor-pointer justify-start gap-2"
      >
        <input
          type="radio"
          :name="field.id"
          :value="choice.value"
          :checked="modelValue === choice.value"
          @change="emit('update:modelValue', choice.value)"
          :class="[
            'radio',
            `radio-${field.options?.size || 'md'}`,
            field.options?.color && `radio-${field.options.color}`
          ]"
          :required="field.required"
        />
        <span class="label-text">{{ choice.label }}</span>
      </label>
    </div>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>