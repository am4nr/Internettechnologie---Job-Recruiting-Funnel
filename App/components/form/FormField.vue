<!-- components/form/FormField.vue -->
<script setup lang="ts">
import type { FormField } from '~/types/form'

const props = defineProps<{
  field: FormField
  component: string
  modelValue?: any
  preview?: boolean
}>()

const emit = defineEmits<{
  edit: [field: FormField]
  delete: [field: FormField]
  'update:modelValue': [value: any]
}>()

const handleEdit = (event: Event) => {
  event.preventDefault() // Prevent event bubbling
  emit('edit', props.field)
}

const handleDelete = (event: Event) => {
  event.preventDefault()
  emit('delete', props.field)
}
</script>

<template>
  <div class="card bg-base-200 mb-2">
    <div class="card-body p-4">
      <div class="flex items-center gap-4">
        <!-- Drag handle -->
        <i v-if="!preview" class="fas fa-grip-vertical cursor-move text-base-content/50"></i>
        
        <!-- Field content -->
        <div class="flex-1">
          <component
            :is="component"
            :field="field"
            :model-value="modelValue"
            :preview="preview"
            @update:model-value="$emit('update:modelValue', $event)"
          />
        </div>

        <!-- Edit and Delete buttons -->
        <div v-if="!preview" class="flex gap-2">
          <button 
            @click="handleEdit"
            class="btn btn-ghost btn-sm"
          >
            <i class="fas fa-edit"></i>
          </button>
          <button 
            @click="handleDelete"
            class="btn btn-ghost btn-sm text-error"
          >
            <i class="fas fa-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>