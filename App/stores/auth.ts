import type { Database } from '~/types/database'

type AppPermission = Database['public']['Enums']['app_permission']

interface UserPermissionsResponse {
  permissions: AppPermission[]
}

// Debug helper
const debug = (message: string, data?: any) => {
  console.log(`[AuthStore Debug] ${message}`, data || '')
}

export const useAuthStore = () => {
  const permissions = useState<AppPermission[]>('permissions', () => [])
  const lastPermissionsFetch = useState<number | null>('lastPermissionsFetch', () => null)
  const isInitialized = useState<boolean>('authStoreInitialized', () => false)
  const CACHE_DURATION = 30 * 60 * 1000 // 30 minutes

  const fetchPermissions = async (forceRefresh: boolean = false) => {
    debug('fetchPermissions called', { forceRefresh })
    const user = useSupabaseUser()
    
    if (!user.value?.id) {
      debug('No user ID available')
      return []
    }

    debug('Current cache state:', {
      lastFetch: lastPermissionsFetch.value,
      cacheAge: lastPermissionsFetch.value ? Date.now() - lastPermissionsFetch.value : null,
      cacheDuration: CACHE_DURATION,
      currentPermissions: permissions.value,
      userId: user.value.id,
      isInitialized: isInitialized.value
    })

    // Only fetch if not initialized, not cached, cache expired, or force refresh
    if (!isInitialized.value || forceRefresh || !lastPermissionsFetch.value || Date.now() - lastPermissionsFetch.value > CACHE_DURATION) {
      debug('Cache miss or force refresh, fetching fresh permissions')
      const client = useSupabaseClient<Database>()
      const { data: response, error } = await client.rpc('get_user_permissions', {
        user_id: user.value.id
      })
      
      debug('RPC raw response:', response)
      
      if (!error && response) {
        // Response is a table with a single row containing a permissions array
        const userPerms = response[0]?.permissions || []
        debug('Extracted permissions:', userPerms)
        permissions.value = userPerms
        lastPermissionsFetch.value = Date.now()
        isInitialized.value = true
        debug('Updated permissions state:', {
          permissions: permissions.value,
          lastFetch: lastPermissionsFetch.value,
          userId: user.value.id,
          isInitialized: isInitialized.value
        })
      } else if (error) {
        debug('Error fetching permissions:', error)
      }
    } else {
      debug('Using cached permissions:', {
        permissions: permissions.value,
        lastFetch: lastPermissionsFetch.value,
        userId: user.value.id,
        isInitialized: isInitialized.value
      })
    }
    return permissions.value
  }

  const hasPermissions = (requiredPermissions: AppPermission[]) => {
    debug('Checking permissions:', {
      required: requiredPermissions,
      current: permissions.value,
      lastFetch: lastPermissionsFetch.value,
      cacheAge: lastPermissionsFetch.value ? Date.now() - lastPermissionsFetch.value : null,
      isInitialized: isInitialized.value
    })
    const result = requiredPermissions.every(perm => {
      const hasPermission = permissions.value.includes(perm)
      debug(`Checking permission "${perm}":`, {
        hasPermission,
        allPermissions: permissions.value,
        permissionType: typeof perm
      })
      return hasPermission
    })
    debug('Permission check result:', result)
    return result
  }

  return {
    permissions,
    lastPermissionsFetch,
    isInitialized,
    fetchPermissions,
    hasPermissions
  }
} 