<script setup lang="ts">
type FormKitType = 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'range' | 'number' | 'email'

interface FormKitOption {
  label: string
  value: string
}

interface Props {
  type: FormKitType
  name: string
  label: string
  validation?: string
  options?: FormKitOption[]
}

defineProps<Props>()
</script>

<template>
  <FormKit
    :type="type"
    :name="name"
    :label="label"
    :validation="validation"
    :options="options?.map(o => ({ label: o.label, value: o.value }))"
  />
</template> 
