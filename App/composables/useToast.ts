import { ref } from 'vue'

export interface Toast {
  id: string
  title: string
  description: string
  color?: string
  type?: 'success' | 'error' | 'info' | 'warning'
  duration?: number
}

const toasts = ref<Toast[]>([])

export function useToast() {
  function add(toast: Omit<Toast, 'id'>) {
    const id = Math.random().toString(36).substring(2)
    const duration = toast.duration ?? 5000

    toasts.value.push({ ...toast, id })

    // Auto remove after duration
    setTimeout(() => {
      remove(id)
    }, duration)
  }

  function remove(id: string) {
    const index = toasts.value.findIndex(t => t.id === id)
    if (index !== -1) {
      toasts.value.splice(index, 1)
    }
  }

  return {
    toasts,
    add,
    remove
  }
} 