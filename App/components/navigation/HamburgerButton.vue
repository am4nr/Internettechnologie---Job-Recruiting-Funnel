<!-- components/navigation/HamburgerButton.vue -->
<template>
  <div>
    <input type="checkbox" 
           id="nav-toggle" 
           class="hidden peer" 
           :checked="modelValue"
           @change="$emit('update:modelValue', $event.target.checked)">
    <label for="nav-toggle" class="md:hidden cursor-pointer p-2">
      <div class="w-6 h-5 relative">
        <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300 
                     origin-center top-0 
                     peer-checked:rotate-45 peer-checked:top-1/2 peer-checked:-translate-y-1/2"></span>
        <span class="absolute w-full h-0.5 bg-gray-600 transition-opacity duration-300
                     top-1/2 -translate-y-1/2
                     peer-checked:opacity-0"></span>
        <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300
                     origin-center bottom-0
                     peer-checked:-rotate-45 peer-checked:bottom-1/2 peer-checked:translate-y-1/2"></span>
      </div>
    </label>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: boolean
}>()

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>