import { useAuthStore } from '~/stores/auth'
import { useSupabaseUser } from '#imports'

// Debug helper
const debug = (message: string, data?: any) => {
  console.log(`[AdminMiddleware Debug] ${message}`, data || '')
}

export default defineNuxtRouteMiddleware(async (to) => {
  const authStore = useAuthStore()
  const user = useSupabaseUser()
  
  debug('Checking admin access for route:', to.path)
  
  if (!user.value) {
    debug('No user found, redirecting to login')
    return navigateTo('/auth/login')
  }

  await authStore.fetchPermissions()
  
  // Check for admin or recruiter permissions based on route
  const isJobsRoute = to.path.startsWith('/admin/jobs')
  const isFormsRoute = to.path.startsWith('/admin/forms')
  const isApplicationsRoute = to.path.startsWith('/admin/applications')
  
  // For jobs, forms, and applications routes, allow both admin and recruiter access
  if (isJobsRoute || isFormsRoute || isApplicationsRoute) {
    const hasAccess = authStore.hasPermissions([
      'jobs.read_all',
      'applications.read_all',
      'forms.read_all'
    ])
    if (!hasAccess) {
      debug('User lacks job management permissions')
      return navigateTo('/unauthorized')
    }
    return
  }
  
  // For all other admin routes, require full admin permissions
  if (!authStore.hasPermissions(['roles.read_all', 'roles.update_all'])) {
    debug('User lacks admin permissions')
    return navigateTo('/unauthorized')
  }
}) 