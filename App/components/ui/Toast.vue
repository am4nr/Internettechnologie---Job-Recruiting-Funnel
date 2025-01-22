<script setup lang="ts">
import { useToast, type Toast } from '@/composables/useToast'

const { toasts, remove } = useToast()

const getIcon = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'fa-solid fa-circle-check'
    case 'error':
      return 'fa-solid fa-circle-xmark'
    case 'warning':
      return 'fa-solid fa-triangle-exclamation'
    case 'info':
    default:
      return 'fa-solid fa-circle-info'
  }
}

const getColor = (type: Toast['type']) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-800'
    case 'error':
      return 'bg-red-50 text-red-800'
    case 'warning':
      return 'bg-yellow-50 text-yellow-800'
    case 'info':
    default:
      return 'bg-blue-50 text-blue-800'
  }
}
</script>

<template>
  <div class="fixed bottom-4 right-4 z-50 space-y-2">
    <TransitionGroup name="toast">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        :class="[
          'flex items-center gap-2 p-4 rounded-lg shadow-lg max-w-sm',
          getColor(toast.type)
        ]"
      >
        <div>
          <i :class="[getIcon(toast.type), 'w-5 h-5']" />
        </div>
        <div class="flex-1">
          <div class="font-medium">{{ toast.title }}</div>
          <div v-if="toast.description" class="text-sm opacity-90">
            {{ toast.description }}
          </div>
        </div>
        <button
          @click="remove(toast.id)"
          class="p-1 rounded hover:bg-black/5"
          :aria-label="'Dismiss ' + toast.title"
        >
          <i class="fa-solid fa-xmark w-4 h-4" />
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(30px);
}
</style> 
