// composables/useSupabaseStore.ts
import { User } from '@supabase/supabase-js'
import type { AppRole, UserProfile, UserWithRole, Application } from '~/types/auth'
import { computed, onMounted } from 'vue'
import { useSupabaseClient, useRouter, useState } from '#imports'

export const useSupabaseStore = () => {
  const supabase = useSupabaseClient()
  const router = useRouter()
  
  // Initialize with default values
  const auth = useState('auth', () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    role: null as AppRole | null,
    permissions: [] as string[],
    isLoading: false,
    error: null as string | null,
    isAuthenticated: false
  }))

  // Reset helper function
  const resetAuthState = () => {
    auth.value = {
      user: null,
      profile: null,
      role: null,
      permissions: [],
      isLoading: false,
      error: null,
      isAuthenticated: false
    }
  }

  // Initialize state on component creation
  onMounted(async () => {
    try {
      await initialize()
    } catch (error) {
      console.error('Failed to initialize store:', error)
      resetAuthState()
    }
  })

  // State management using Nuxt's useState directly
  const users = useState<UserWithRole[]>('users', () => [])
  const usersLastFetched = useState<number>('usersLastFetched', () => 0)
  const applications = useState<Application[]>('applications', () => [])
  const applicationsLastFetched = useState<number>('applicationsLastFetched', () => 0)

  // Computed properties
  const isAdmin = computed(() => auth.value.role === 'admin')
  const isRecruiter = computed(() => auth.value.role === 'recruiter')
  const hasPermission = (permission: string) => auth.value.permissions.includes(permission)

  const fetchUsers = async (force = false) => {
    const CACHE_TIME = 5 * 60 * 1000 // 5 minutes
    if (!force && users.value.length && Date.now() - usersLastFetched.value < CACHE_TIME) {
      return users.value
    }

    try {
      auth.value.isLoading = true
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      const { data: permissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('role, permission')

      if (permissionsError) throw permissionsError

      const combinedData = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id)?.role || 'applicant'
        const userPermissions = permissions
          .filter(p => p.role === userRole)
          .map(p => p.permission)

        return {
          ...profile,
          role: userRole,
          permissions: userPermissions
        }
      })

      users.value = combinedData
      usersLastFetched.value = Date.now()
      return combinedData
    } catch (error) {
      console.error('Error fetching users:', error)
      return []
    } finally {
      auth.value.isLoading = false
    }
  }

  const fetchCurrentUser = async () => {
    try {
      auth.value.isLoading = true
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) return null

      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)

      if (roleError) throw roleError

      auth.value.user = user
      auth.value.profile = profile
      auth.value.role = roleData?.[0]?.role || 'applicant'

      const { data: permissions } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', auth.value.role)

      auth.value.permissions = permissions?.map(p => p.permission) || []

      return profile
    } catch (error) {
      console.error('Profile fetch error:', error)
      return null
    } finally {
      auth.value.isLoading = false
    }
  }

  const updateUserRole = async (userId: string, role: AppRole) => {
    try {
      // First try to delete existing role
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)

      // Then insert new role
      const { error } = await supabase
        .from('user_roles')
        .insert({ user_id: userId, role })

      if (error) throw error
      
      await fetchUsers(true)
      if (userId === auth.value.user?.id) {
        await fetchCurrentUser()
      }
    } catch (error) {
      console.error('Error updating role:', error)
      throw error
    }
  }

  const login = async (email: string, password: string) => {
    try {
      auth.value.isLoading = true
      auth.value.error = null

      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })

      if (error) throw error

      auth.value.user = data.user
      auth.value.isAuthenticated = true
      await fetchCurrentUser()
      router.push('/dashboard')
    } catch (error) {
      auth.value.error = error.message
      throw error
    } finally {
      auth.value.isLoading = false
    }
  }

  const register = async (email: string, password: string) => {
    try {
      auth.value.isLoading = true
      auth.value.error = null

      const { data, error } = await supabase.auth.signUp({
        email, password
      })

      if (error) throw error

      if (!data.user?.confirmed_at) {
        router.push('/auth/confirm-email')
      } else {
        await login(email, password)
      }
    } catch (error) {
      auth.value.error = error.message
      throw error
    } finally {
      auth.value.isLoading = false
    }
  }

  // Update logout to use reset helper
  const logout = async () => {
    try {
      auth.value.isLoading = true
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      resetAuthState()
      users.value = []
      applications.value = []
      
      router.push('/auth/login')
    } catch (error) {
      auth.value.error = error.message
    } finally {
      auth.value.isLoading = false
    }
  }

  const initialize = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      auth.value.isAuthenticated = !!session

      if (session) {
        await fetchCurrentUser()
      }
    } catch (error) {
      console.error('Init error:', error)
    }
  }

  // Add auth state listener
  supabase.auth.onAuthStateChange(async (event, session) => {
    auth.value.isAuthenticated = !!session
    if (session) {
      await initialize()
    }
  })

  return {
    // State
    auth,
    users,
    applications,

    // Computed
    isAdmin,
    isRecruiter,
    hasPermission,

    // Methods
    login,
    register,
    logout,
    fetchUsers,
    fetchCurrentUser,
    updateUserRole,
    initialize
  }
}