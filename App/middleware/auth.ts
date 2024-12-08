// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const store = useSupabaseStore()

  // Wait for auth store to be initialized
  if (!store.auth.value.isInitialized) {
    await store.initialize()
  }

  // Debug logging
  console.log('Auth Middleware:', {
    path: to.path,
    user: user.value?.email,
    role: store.auth.value.role,
    requiredRole: to.meta.requiresRole,
    isAuthenticated: store.auth.value.isAuthenticated,
    isInitialized: store.auth.value.isInitialized
  })
  
  // Handle auth pages (requiresAuth: false)
  if (to.meta.requiresAuth === false) {
    if (store.auth.value.isAuthenticated) {
      return navigateTo('/dashboard')
    }
    return
  }

  // Handle protected pages (requiresAuth: true or undefined)
  if (!store.auth.value.isAuthenticated) {
    return navigateTo('/auth/login')
  }

  // Check if role restriction exists
  const requiredRole = to.meta.requiresRole
  if (requiredRole && store.auth.value.role !== requiredRole) {
    console.log(`Role ${requiredRole} required, but user has ${store.auth.value.role}`)
    return navigateTo('/')
  }
})