// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const { userRole } = useAuthState()
  
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
  if (requiredRole && userRole.value !== requiredRole) {
    console.log(`Role ${requiredRole} required, but user has ${userRole.value}`)
    return navigateTo('/')
  }
})