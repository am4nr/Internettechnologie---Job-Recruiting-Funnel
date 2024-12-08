<script setup lang="ts">
defineProps<{
  label: string
  required?: boolean
  modelValue?: string
  placeholder?: string
  rows?: number
  bordered?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
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
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      :class="[
        'textarea w-full',
        {
          'textarea-bordered': bordered
        }
      ]"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template> 