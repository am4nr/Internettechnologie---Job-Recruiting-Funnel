<!-- components/form/fields/CheckboxField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: boolean | string[]
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean | string[]]
}>()

const isGroup = computed(() => Array.isArray(props.modelValue))

const handleChange = (event: Event, value?: string) => {
  const checkbox = event.target as HTMLInputElement
  
  if (isGroup.value && value) {
    const values = [...(props.modelValue as string[])]
    if (checkbox.checked) {
      values.push(value)
    } else {
      const index = values.indexOf(value)
      if (index > -1) values.splice(index, 1)
    }
    emit('update:modelValue', values)
  } else {
    emit('update:modelValue', checkbox.checked)
  }
}
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>
    
    <!-- Single Checkbox -->
    <label v-if="!isGroup" class="label cursor-pointer">
      <input
        type="checkbox"
        :checked="modelValue as boolean"
        @change="handleChange"
        :class="[
          'checkbox',
          `checkbox-${field.options?.size || 'md'}`,
          field.options?.color && `checkbox-${field.options.color}`
        ]"
        :required="field.required"
      />
      <span class="label-text">{{ field.options?.placeholder }}</span>
    </label>

    <!-- Checkbox Group -->
    <div v-else class="space-y-2">
      <label 
        v-for="choice in field.options?.choices"
        :key="choice.value"
        class="label cursor-pointer justify-start gap-2"
      >
        <input
          type="checkbox"
          :checked="(modelValue as string[]).includes(choice.value)"
          @change="e => handleChange(e, choice.value)"
          :class="[
            'checkbox',
            `checkbox-${field.options?.size || 'md'}`,
            field.options?.color && `checkbox-${field.options.color}`
          ]"
        />
        <span class="label-text">{{ choice.label }}</span>
      </label>
    </div>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>