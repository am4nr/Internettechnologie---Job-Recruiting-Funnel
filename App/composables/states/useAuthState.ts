// composables/states/useAuthState.ts
import type { User } from '@supabase/supabase-js'
import type { AppRole, UserProfile } from '~/types/auth'

export const useAuthState = () => {
  return useState('auth', () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    role: null as AppRole | null,
    permissions: [] as string[],
    isLoading: false,
    error: null as string | null,
    isAuthenticated: false
  }))
}