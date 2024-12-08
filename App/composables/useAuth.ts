import { useState, useSupabaseUser } from '#imports'
import { useSupabaseClient } from '#imports'
import type { AppPermission } from '~/types/auth'

export const useAuth = () => {
  const permissionCache = useState<Record<string, boolean>>('permission-cache', () => ({}))
  const cacheTTL = 5 * 60 * 1000 // 5 minutes
  const supabase = useSupabaseClient()

  const hasPermission = async (permission: AppPermission) => {
    const user = useSupabaseUser()
    const cacheKey = `${user.value?.id}:${permission}`
    
    // Check cache first
    if (permissionCache.value[cacheKey]) {
      return true
    }

    // If not in cache, check database
    const { data, error } = await supabase.rpc('authorize', { 
      requested_permission: permission 
    } as any) // temporary type assertion until we add proper RPC types

    if (error) {
      console.error('Permission check error:', error)
      return false
    }

    if (data) {
      // Cache the positive result
      permissionCache.value[cacheKey] = true
      setTimeout(() => {
        delete permissionCache.value[cacheKey]
      }, cacheTTL)
    }

    return !!data
  }

  // Clear cache on role changes
  const clearPermissionCache = () => {
    permissionCache.value = {}
  }

  return {
    hasPermission,
    clearPermissionCache
  }
} 