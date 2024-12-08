<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  modelValue?: string | number
  placeholder?: string
  size?: 'xs' | 'sm' | 'md' | 'lg'
  bordered?: boolean
  variant?: 'primary' | 'secondary' | 'accent' | 'ghost' | 'info' | 'success' | 'warning' | 'error'
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
    <input
      :value="modelValue"
      type="text"
      :placeholder="placeholder"
      :class="[
        'input w-full',
        {
          'input-bordered': bordered,
          [`input-${size}`]: size,
          [`input-${variant}`]: variant
        }
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template> 