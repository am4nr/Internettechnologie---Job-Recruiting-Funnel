// composables/useAuthState.ts

interface AuthState {
  isAuthenticated: boolean
  userRole: UserRole | null
  uuid: string | null
  email: string | null
}

type UserRole = 'admin' | 'bewerber' | 'user'

export const useAuthState = () => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()
  const router = useRouter()

  const state = useState<AuthState>('auth', () => ({
    isAuthenticated: !!user.value,
    userRole: null,
    uuid: user.value?.id || null,
    email: user.value?.email || null
  }))

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Role fetch error:', error)
        return
      }

      if (data) {
        state.value.userRole = data.role as UserRole
      }
    } catch (err) {
      console.error('Error in fetchUserRole:', err)
    }
  }

  const setUserRole = async (userId: string, role: UserRole) => {
    try {
      // Define the type for the upsert data
      type UserRoleRecord = {
        id: string
        role: UserRole
      }

      const { error } = await supabase
        .from('user_roles')
        .upsert({
          id: userId,
          role: role
        })

      if (error) throw error
      state.value.userRole = role
    } catch (err) {
      console.error('Error setting role:', err)
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear state
      state.value.isAuthenticated = false
      state.value.userRole = null
      state.value.uuid = null
      state.value.email = null
      
      router.push('/')
    } catch (error) {
      console.error('Error logging out:', error)
    }
  }

  // Initialize auth state when user changes
  watch(user, async (newUser) => {
    state.value.isAuthenticated = !!newUser
    state.value.uuid = newUser?.id || null
    state.value.email = newUser?.email || null

    if (newUser?.id) {
      await fetchUserRole(newUser.id)
    } else {
      state.value.userRole = null
    }
  }, { immediate: true })

  return {
    isAuthenticated: computed(() => state.value.isAuthenticated),
    userRole: computed(() => state.value.userRole),
    uuid: computed(() => state.value.uuid),
    email: computed(() => state.value.email),
    setUserRole,
    logout
  }
}