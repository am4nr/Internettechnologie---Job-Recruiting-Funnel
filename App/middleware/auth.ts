// middleware/auth.ts
import { useSupabaseUser } from '#imports'
import { useSupabaseStore } from '~/composables/useSupabaseStore'

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const store = useSupabaseStore()
  
  // Handle auth pages (requiresAuth: false)
  if (to.meta.requiresAuth === false && user.value) {
    return navigateTo('/dashboard')
  }

  // Handle protected pages (requiresAuth: true or undefined)
  if (to.meta.requiresAuth !== false && !user.value) {
    return navigateTo('/auth/login')
  }

  // Check if role restriction exists
  const requiredRole = to.meta.requiresRole
  if (requiredRole && store.auth.value.role !== requiredRole) {
    console.log(`Role ${requiredRole} required, but user has ${store.auth.value.role}`)
    return navigateTo('/')
  }
})