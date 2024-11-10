// composables/useAuthState.ts
import { useSupabaseUser } from '#imports'

export interface AuthState {
  isAuthenticated: boolean
  userRole: string | null
}

export const useAuthState = () => {
  const user = useSupabaseUser()
  const state = useState<{
    isAuthenticated: boolean
    userRole: string | null
  }>('auth', () => ({
    isAuthenticated: !!user.value,
    userRole: null
  }))

  // Watch for auth changes
  watch(user, async (newUser) => {
    console.log('User state changed:', newUser)
    state.value.isAuthenticated = !!newUser
    
    if (newUser) {
      // Fetch role from Supabase
      const supabase = useSupabaseClient()
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', newUser.id)
        .single()
      
      if (!error && data) {
        state.value.userRole = data.role
      }
    } else {
      state.value.userRole = null
    }
  }, { immediate: true })

  return {
    isAuthenticated: computed(() => state.value.isAuthenticated),
    userRole: computed(() => state.value.userRole),
    setRole: (role: string | null) => state.value.userRole = role,
    setAuth: (isAuth: boolean) => state.value.isAuthenticated = isAuth
  }
}