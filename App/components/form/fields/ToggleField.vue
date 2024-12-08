<!-- components/form/fields/ToggleField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const labelPosition = computed(() => props.field.options?.labelPosition || 'right')
</script>

<template>
  <div class="form-control">
    <label v-if="!preview && labelPosition === 'top'" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>

    <label class="label cursor-pointer" :class="{
      'justify-start gap-2': labelPosition === 'right',
      'flex-row-reverse justify-end gap-2': labelPosition === 'left'
    }">
      <span v-if="labelPosition !== 'top'" class="label-text">{{ field.label }}</span>
      <input
        type="checkbox"
        :checked="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        :class="[
          'toggle',
          `toggle-${field.options?.size || 'md'}`,
          field.options?.color && `toggle-${field.options.color}`
        ]"
        :required="field.required"
      />
    </label>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template><!-- components/form/fields/ToggleField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  modelValue: boolean
  preview?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const labelPosition = computed(() => props.field.options?.labelPosition || 'right')
</script>

<template>
  <div class="form-control">
    <label v-if="!preview && labelPosition === 'top'" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>

    <label class="label cursor-pointer" :class="{
      'justify-start gap-2': labelPosition === 'right',
      'flex-row-reverse justify-end gap-2': labelPosition === 'left'
    }">
      <span v-if="labelPosition !== 'top'" class="label-text">{{ field.label }}</span>
      <input
        type="checkbox"
        :checked="modelValue"
        @change="emit('update:modelValue', ($event.target as HTMLInputElement).checked)"
        :class="[
          'toggle',
          `toggle-${field.options?.size || 'md'}`,
          field.options?.color && `toggle-${field.options.color}`
        ]"
        :required="field.required"
      />
    </label>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>