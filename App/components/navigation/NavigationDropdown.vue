<!-- components/navigation/NavigationDropdown.vue -->
<template>
  <div class="relative group w-full md:w-auto">
    <!-- Trigger Button -->
    <button 
      :id="dropdownId"
      class="w-full md:w-auto px-3 py-2 inline-flex items-center justify-between"
      :class="[
        isOpen ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600',
        'transition-colors'
      ]"
      @click="toggleDropdown"
      aria-haspopup="true"
      :aria-expanded="isOpen"
    >
      {{ label }}
      <svg 
        class="w-4 h-4 ml-1 transform transition-transform duration-200"
        :class="{ 'rotate-180': isOpen }"
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </button>

    <!-- Dropdown Content -->
    <div
      :id="`${dropdownId}-menu`"
      :class="[
        'md:absolute left-0 md:mt-1 w-full md:w-48 bg-white md:rounded-md md:shadow-lg',
        'transform transition-all duration-200 origin-top',
        'md:invisible md:opacity-0 md:group-hover:visible md:group-hover:opacity-100',
        // Mobile: slide down, Desktop: fade in
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 md:max-h-96 opacity-0 md:opacity-100'
      ]"
      role="menu"
      :aria-labelledby="dropdownId"
    >
      <div class="py-1">
        <slot></slot>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'

interface Props {
  label: string
}

const props = defineProps<Props>()
const dropdownId = `dropdown-${Math.random().toString(36).slice(2, 11)}`
const isOpen = ref(false)
const isMobile = ref(false)

function checkMobile() {
  isMobile.value = window.innerWidth < 768
}

function toggleDropdown() {
  if (isMobile.value) {
    isOpen.value = !isOpen.value
  }
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', checkMobile)
})
</script>