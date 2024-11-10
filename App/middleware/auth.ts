// middleware/auth.ts
export default defineNuxtRouteMiddleware(async (to) => {
  const { startLoading, stopLoading } = useLoading()
  const user = useSupabaseUser()
  
  try {
    startLoading('auth')
    
    if (!user.value && to.path.startsWith('/jobs')) {
      return navigateTo('/auth/login')
    }
  } finally {
    stopLoading('auth')
  }
})