import { useAuthStore } from '~/stores/auth'

export default defineNuxtPlugin(async () => {
  const supabase = useSupabaseClient()
  const authStore = useAuthStore()

  // Try to recover session on client side
  const { data: { session }, error } = await supabase.auth.getSession()
  
  if (session) {
    // Initialize auth state with recovered session
    await authStore.fetchPermissions()
  }

  // Set up auth state change listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      await authStore.fetchPermissions()
    } else if (event === 'SIGNED_OUT') {
      authStore.permissions.value = []
      authStore.lastPermissionsFetch.value = 0
    }
  })
}) 