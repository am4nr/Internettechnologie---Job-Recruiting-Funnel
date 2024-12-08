<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  modelValue?: string | number
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  choices?: Array<{ label: string; value: string | number }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()
</script>

<template>
  <div class="form-control w-full">
    <label class="label">
      <span class="label-text">
        {{ label }}
        <span v-if="required" class="text-error">*</span>
      </span>
    </label>
    <select
      :value="modelValue"
      :class="[
        'select w-full',
        {
          'select-bordered': bordered,
          [`select-${size}`]: size
        }
      ]"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option disabled value="">{{ placeholder || 'Select an option' }}</option>
      <option
        v-for="choice in choices"
        :key="choice.value"
        :value="choice.value"
      >
        {{ choice.label }}
      </option>
    </select>
  </div>
</template> 