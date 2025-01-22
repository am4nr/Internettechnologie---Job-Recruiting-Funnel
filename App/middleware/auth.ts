// middleware/auth.ts
import type { Database } from '~/types/database'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseUser } from '#imports'

type AppPermission = Database['public']['Enums']['app_permission']

// Protected route patterns
const PROTECTED_ROUTES = ['/admin', '/dashboard'] as const

// Debug helper
const debug = (message: string, data?: any) => {
  console.log(`[AuthMiddleware Debug] ${message}`, data || '')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  
  debug('Checking auth for route:', to.path)
  
  const isProtectedRoute = PROTECTED_ROUTES.some(route => to.path.startsWith(route))
  
  // Handle public routes
  if (to.meta.public || to.path === '/auth/login') {
    return
  }

  // Check authentication for protected routes
  if (isProtectedRoute && !user.value) {
    debug('User not authenticated, redirecting to login')
    return navigateTo({
      path: '/auth/login',
      query: { redirect: to.fullPath }
    })
  }

  // Check permissions if required
  const requiredPermissions = to.meta.permissions as AppPermission[] || []
  if (requiredPermissions.length > 0) {
    const auth = useAuthStore()
    await auth.fetchPermissions() // Only fetches if cache is expired

    if (!auth.hasPermissions(requiredPermissions)) {
      return navigateTo('/unauthorized')
    }
  }
})