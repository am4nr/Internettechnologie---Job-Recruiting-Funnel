<script setup lang="ts">
import { ref } from 'vue'
import { useFormTemplates, type FormField } from '@/composables/useFormTemplates'
import { useToast } from '@/composables/useToast'

const formSchema = ref<FormField[]>([])
const title = ref('New Form Template')
const description = ref('A form template created with FormKit')
const { createTemplate } = useFormTemplates()

const handleSave = async () => {
  try {
    await createTemplate({
      title: title.value,
      description: description.value,
      schema: formSchema.value
    })
    
    // Reset form
    formSchema.value = []
    title.value = 'New Form Template'
    description.value = 'A form template created with FormKit'
    
    // Show success message
    useToast().add({
      title: 'Success',
      description: 'Form template saved successfully',
      type: 'success'
    })
  } catch (error) {
    console.error('Error saving form template:', error)
    // Show error message
    useToast().add({
      title: 'Error',
      description: 'Failed to save form template',
      type: 'error'
    })
  }
}
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <div class="space-y-4">
        <h1 class="text-2xl font-bold">Form Builder</h1>
        <div class="space-y-2">
          <FormKit
            type="text"
            label="Template Title"
            v-model="title"
            validation="required"
          />
          <FormKit
            type="textarea"
            label="Template Description"
            v-model="description"
          />
        </div>
      </div>
      <button 
        class="btn btn-primary"
        @click="handleSave"
      >
        Save Template
      </button>
    </div>

    <FormBuilder v-model="formSchema" />
  </div>
</template> 
