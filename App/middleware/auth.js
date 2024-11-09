// middleware/auth.ts
export default defineNuxtRouteMiddleware((to, from) => {
  const user = useSupabaseUser()
  
  if (!user.value && to.path !== '/auth/login') {
    return navigateTo('/auth/login')
  }
})