<!-- components/navigation/NavigationItem.vue -->
<template>
  <NuxtLink 
    :to="to" 
    class="block px-3 py-2 transition-colors"
    :class="[
      isActive 
        ? 'text-blue-600 font-medium' 
        : 'text-gray-700 hover:text-blue-600'
    ]"
    @click="$emit('click')"
  >
    <slot></slot>
  </NuxtLink>
</template>

<script setup lang="ts">
interface Props {
  to: string
  isActive?: boolean
}

defineProps<Props>()
defineEmits<{
  click: [] // For mobile menu closing
}>()
</script>