import { ref, readonly, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: Error | null
}

const state = ref<AuthState>({
  user: null,
  loading: true,
  error: null
})

export const useAuth = () => {
  const supabase = useSupabaseClient()

  const initialize = async () => {
    try {
      state.value.loading = true
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error) throw error
      state.value.user = user
    } catch (error) {
      state.value.error = error as Error
      state.value.user = null
    } finally {
      state.value.loading = false
    }
  }

  const setupAuthListener = () => {
    supabase.auth.onAuthStateChange(async (event, session) => {
      state.value.loading = true
      try {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const { data: { user }, error } = await supabase.auth.getUser()
          if (error) throw error
          state.value.user = user
        } else if (event === 'SIGNED_OUT') {
          state.value.user = null
        }
      } catch (error) {
        state.value.error = error as Error
        state.value.user = null
      } finally {
        state.value.loading = false
      }
    })
  }

  const signIn = async (email: string, password: string) => {
    try {
      state.value.loading = true
      state.value.error = null
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      if (error) throw error
      state.value.user = data.user
      return data
    } catch (error) {
      state.value.error = error as Error
      throw error
    } finally {
      state.value.loading = false
    }
  }

  const signOut = async () => {
    try {
      state.value.loading = true
      state.value.error = null
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      state.value.user = null
    } catch (error) {
      state.value.error = error as Error
      throw error
    } finally {
      state.value.loading = false
    }
  }

  const isAdmin = computed(() => {
    return state.value.user?.app_metadata?.role === 'admin'
  })

  // Initialize auth state
  if (process.client) {
    initialize()
    setupAuthListener()
  }

  return {
    user: readonly(computed(() => state.value.user)),
    loading: readonly(computed(() => state.value.loading)),
    error: readonly(computed(() => state.value.error)),
    isAdmin,
    signIn,
    signOut,
    initialize
  }
} 