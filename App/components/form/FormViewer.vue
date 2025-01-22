<script setup lang="ts">
import { ref, computed } from 'vue'
import type { FormField } from '~/types/form'

const props = defineProps<{
  modelValue?: Record<string, any>
  schema: FormField[]
  submitLabel?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Record<string, any>]
  'submit': [data: Record<string, any>]
}>()

const formData = ref(props.modelValue || {})

const updateField = (field: FormField, value: any) => {
  formData.value = {
    ...formData.value,
    [field.name]: value
  }
  emit('update:modelValue', formData.value)
}

const handleSubmit = (e: Event) => {
  e.preventDefault()
  emit('submit', formData.value)
}
</script>

<template>
  <form @submit="handleSubmit" class="space-y-6">
    <div v-for="field in schema" :key="field.id" class="form-control">
      <label :for="field.id" class="label">
        <span class="label-text">{{ field.label }}</span>
      </label>

      <!-- Text Input -->
      <input
        v-if="field.type === 'text' || field.type === 'email' || field.type === 'tel'"
        :id="field.id"
        :type="field.type"
        :name="field.name"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :required="field.validation?.includes('required')"
        class="input input-bordered w-full"
        @input="e => updateField(field, (e.target as HTMLInputElement).value)"
      />

      <!-- Textarea -->
      <textarea
        v-else-if="field.type === 'textarea'"
        :id="field.id"
        :name="field.name"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :required="field.validation?.includes('required')"
        class="textarea textarea-bordered w-full"
        @input="e => updateField(field, (e.target as HTMLTextAreaElement).value)"
      ></textarea>

      <!-- Select -->
      <select
        v-else-if="field.type === 'select'"
        :id="field.id"
        :name="field.name"
        :value="formData[field.name]"
        :required="field.validation?.includes('required')"
        class="select select-bordered w-full"
        @change="e => updateField(field, (e.target as HTMLSelectElement).value)"
      >
        <option value="">Select an option</option>
        <option
          v-for="option in field.options"
          :key="option.value"
          :value="option.value"
        >
          {{ option.label }}
        </option>
      </select>

      <!-- Number Input -->
      <input
        v-else-if="field.type === 'number'"
        :id="field.id"
        type="number"
        :name="field.name"
        :value="formData[field.name]"
        :placeholder="field.placeholder"
        :required="field.validation?.includes('required')"
        class="input input-bordered w-full"
        @input="e => updateField(field, (e.target as HTMLInputElement).valueAsNumber)"
      />
    </div>

    <div class="flex justify-end mt-6">
      <button type="submit" class="btn btn-primary">
        {{ submitLabel || 'Submit' }}
      </button>
    </div>
  </form>
</template> 