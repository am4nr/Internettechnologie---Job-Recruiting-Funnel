// composables/useSupabaseStore.ts
import type { User } from '@supabase/supabase-js'
import type { AppRole, UserProfile, UserWithRole, Application, Role, AppPermission } from '~/types/auth'
import { computed, onMounted, onUnmounted } from 'vue'
import { useSupabaseClient, useRouter, useState } from '#imports'
import { useAuth } from '~/composables/useAuth'
import type { Database } from '~/types/database'

export const useSupabaseStore = () => {
  const supabase = useSupabaseClient<Database>()
  const router = useRouter()
  const authHelper = useAuth()
  
  // State management
  const auth = useState('auth', () => ({
    user: null as User | null,
    profile: null as UserProfile | null,
    role: null as AppRole | null,
    permissions: [] as AppPermission[],
    isLoading: false,
    error: null as string | null,
    isAuthenticated: false,
    isInitialized: false
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
      isAuthenticated: false,
      isInitialized: true
    }
    authHelper.clearPermissionCache()
  }

  // Fetch roles and their permissions
  const fetchRoles = async () => {
    try {
      const { data: rolePerms, error: permsError } = await supabase
        .from('role_permissions')
        .select('role, permission')

      if (permsError) throw permsError

      if (!rolePerms?.length) {
        return { data: [] }
      }

      // Get unique roles and their permissions
      const uniqueRoles = [...new Set(rolePerms.map(rp => rp.role))]
      const roles = uniqueRoles.map(roleName => ({
        name: roleName,
        permissions: rolePerms
          .filter(rp => rp.role === roleName)
          .map(rp => rp.permission)
      }))

      return { data: roles }
    } catch (error) {
      console.error('Error fetching roles:', error)
      return { error }
    }
  }

  // Update role permissions
  const updateRolePermissions = async (role: string, permission: string, enabled: boolean) => {
    try {
      if (enabled) {
        const { error } = await supabase
          .from('role_permissions')
          .insert({ role, permission })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('role_permissions')
          .delete()
          .match({ role, permission })
        if (error) throw error
      }
      return await fetchRoles()
    } catch (error) {
      console.error('Error updating role permissions:', error)
      return { error }
    }
  }

  // Fetch users with their roles
  const fetchUsers = async () => {
    try {
      auth.value.isLoading = true
      
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (profilesError) throw profilesError

      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role')

      if (rolesError) throw rolesError

      const { data: permissions, error: permissionsError } = await supabase
        .from('role_permissions')
        .select('role, permission')

      if (permissionsError) throw permissionsError

      const users = profiles.map(profile => {
        const userRole = userRoles.find(r => r.user_id === profile.id)?.role || 'applicant'
        const userPermissions = permissions
          .filter(p => p.role === userRole)
          .map(p => p.permission)

        return {
          ...profile,
          role: userRole as AppRole,
          permissions: userPermissions
        }
      })

      return { data: users }
    } catch (error) {
      console.error('Error fetching users:', error)
      return { error }
    } finally {
      auth.value.isLoading = false
    }
  }

  // Update user role
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
      
      // If updating current user's role, refresh their profile
      if (userId === auth.value.user?.id) {
        await fetchCurrentUser()
      }

      return await fetchUsers()
    } catch (error) {
      console.error('Error updating role:', error)
      return { error }
    }
  }

  // Fetch current user's profile and role
  const fetchCurrentUser = async () => {
    try {
      auth.value.isLoading = true
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        resetAuthState()
        return null
      }

      // Fetch profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profileError) throw profileError

      // Fetch role
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single()

      // Set user data
      auth.value.user = user
      auth.value.profile = profile
      auth.value.role = (roleData?.role || 'applicant') as AppRole
      auth.value.isAuthenticated = true

      // Fetch permissions for the role
      const { data: permissions, error: permError } = await supabase
        .from('role_permissions')
        .select('permission')
        .eq('role', auth.value.role)

      if (!permError) {
        auth.value.permissions = permissions?.map(p => p.permission) || []
      }

      return profile
    } catch (error) {
      console.error('Profile fetch error:', error)
      resetAuthState()
      return null
    } finally {
      auth.value.isLoading = false
    }
  }

  // Initialize state
  const initialize = async () => {
    try {
      if (auth.value.isInitialized) return

      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        auth.value.user = session.user
        await fetchCurrentUser()
      } else {
        resetAuthState()
      }
    } catch (error) {
      console.error('Init error:', error)
      resetAuthState()
    } finally {
      auth.value.isInitialized = true
    }
  }

  // Auth state listener
  onMounted(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN') {
        auth.value.user = session?.user || null
        await fetchCurrentUser()
      } else if (event === 'SIGNED_OUT') {
        resetAuthState()
      } else if (event === 'USER_UPDATED') {
        auth.value.user = session?.user || null
        await fetchCurrentUser()
      }
    })

    // Cleanup subscription
    onUnmounted(() => {
      subscription.unsubscribe()
    })
  })

  // Initialize on store creation
  initialize()

  // Computed properties
  const isAdmin = computed(() => auth.value.role === 'admin')
  const isRecruiter = computed(() => auth.value.role === 'recruiter')

  // Auth methods
  const login = async (email: string, password: string, shouldRedirect: boolean = true) => {
    try {
      auth.value.isLoading = true
      auth.value.error = null

      const { data, error } = await supabase.auth.signInWithPassword({
        email, password
      })

      if (error) throw error

      auth.value.user = data.user
      await fetchCurrentUser()
      
      if (shouldRedirect) {
        router.push('/dashboard')
      }
    } catch (error: any) {
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
    } catch (error: any) {
      auth.value.error = error.message
      throw error
    } finally {
      auth.value.isLoading = false
    }
  }

  const logout = async (shouldRedirect: boolean = true) => {
    try {
      auth.value.isLoading = true
      const { error } = await supabase.auth.signOut()
      
      if (error) throw error

      resetAuthState()
      
      if (shouldRedirect) {
        router.push('/auth/login')
      }
    } catch (error: any) {
      auth.value.error = error.message
    } finally {
      auth.value.isLoading = false
    }
  }

  return {
    auth,
    isAdmin,
    isRecruiter,
    hasPermission: authHelper.hasPermission,
    login,
    register,
    logout,
    fetchUsers,
    fetchRoles,
    updateRolePermissions,
    fetchCurrentUser,
    updateUserRole,
    initialize,
  }
}