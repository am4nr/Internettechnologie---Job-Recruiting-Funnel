<!-- components/form/fields/RatingField.vue -->
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

const max = computed(() => props.field.options?.max || 5)
const hover = ref(-1)
const stars = computed(() => Array(max.value * 2).fill(0))

const getIconClass = (index: number) => {
  const value = (index + 1) / 2
  const isHalf = index % 2 === 0
  
  if (hover.value >= index) {
    return 'fas fa-star text-warning'
  } 
  if (hover.value === index - 1 && props.field.options?.half) {
    return 'fas fa-star-half-alt text-warning'
  }
  if (props.modelValue >= value) {
    return 'fas fa-star text-warning'
  }
  if (props.modelValue + 0.5 === value && props.field.options?.half) {
    return 'fas fa-star-half-alt text-warning'
  }
  return 'far fa-star text-warning'
}

const handleClick = (index: number) => {
  const value = (index + 1) / 2
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="form-control">
    <label v-if="!preview" class="label">
      {{ field.label }}
      <span v-if="field.required" class="text-error">*</span>
    </label>

    <div class="flex gap-1" 
         @mouseleave="hover = -1">
      <button
        v-for="(_, index) in stars"
        :key="index"
        type="button"
        class="btn btn-ghost btn-xs px-0 hover:bg-transparent"
        @click="handleClick(index)"
        @mouseover="hover = index"
      >
        <i :class="getIconClass(index)"></i>
      </button>
      <span class="ml-2 text-sm">{{ modelValue || 0 }}/{{ max }}</span>
    </div>

    <label v-if="field.validation?.message" class="label">
      <span class="label-text-alt text-error">{{ field.validation.message }}</span>
    </label>
  </div>
</template>