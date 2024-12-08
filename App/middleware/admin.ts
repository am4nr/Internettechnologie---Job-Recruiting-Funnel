import { useSupabaseStore } from '~/composables/useSupabaseStore'

export default defineNuxtRouteMiddleware(async (to) => {
  const store = useSupabaseStore()
  const { auth } = store
  
  // Wait for auth to be initialized
  if (!auth.value.isInitialized) {
    await store.initialize()
  }

  // Check if user is authenticated and has admin role
  if (!auth.value.isAuthenticated || auth.value.role !== 'admin') {
    return navigateTo('/auth/login')
  }
}) 