<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'

type Role = 'admin' | 'recruiter' | 'applicant'

interface UserWithRole {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string | null
  role: Role
  permissions: string[]
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const users = ref<UserWithRole[]>([])

const fetchUsers = async () => {
  try {
    loading.value = true
    const { data: profiles, error: profilesError } = await client
      .from('user_profiles')
      .select('id, email, first_name, last_name, created_at')
      .order('created_at', { ascending: false })

    if (profilesError) throw profilesError

    const { data: userRoles, error: rolesError } = await client
      .from('user_roles')
      .select('user_id, role')

    if (rolesError) throw rolesError

    const { data: permissions, error: permissionsError } = await client
      .from('role_permissions')
      .select('role, permission')

    if (permissionsError) throw permissionsError

    users.value = profiles.map(profile => {
      const userRole = (userRoles.find(r => r.user_id === profile.id)?.role || 'applicant') as Role
      const userPermissions = permissions
        .filter(p => p.role === userRole)
        .map(p => p.permission)

      return {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        created_at: profile.created_at,
        role: userRole,
        permissions: userPermissions
      }
    })
  } catch (err) {
    console.error('Error fetching users:', err)
    error.value = 'Failed to load users'
  } finally {
    loading.value = false
  }
}

const updateUserRole = async (userId: string, newRole: Role) => {
  try {
    // First try to delete existing role
    await client
      .from('user_roles')
      .delete()
      .eq('user_id', userId)

    // Then insert new role
    const { error } = await client
      .from('user_roles')
      .insert({ user_id: userId, role: newRole })

    if (error) throw error
    await fetchUsers()
  } catch (err) {
    console.error('Error updating user role:', err)
    error.value = 'Failed to update user role'
  }
}

onMounted(async () => {
  await fetchUsers()
})

// Available roles
const availableRoles: Role[] = ['admin', 'recruiter', 'applicant']

// Get user initials
const getUserInitials = (user: UserWithRole) => {
  if (!user.first_name && !user.last_name) {
    return user.email.charAt(0).toUpperCase()
  }
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

// Format date with fallback
const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div class="h-full flex flex-col">
    <div class="border-b">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold">User Management</h1>
      </div>
    </div>
    
    <div class="flex-1 overflow-auto">
      <div class="p-6">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-if="error" class="alert alert-error mb-6">
          {{ error }}
        </div>

        <div v-else-if="users.length === 0" class="text-center py-8 text-gray-500">
          No users found.
        </div>

        <div v-else>
          <table class="table table-zebra w-full">
            <thead>
              <tr>
                <th class="bg-base-200/50">User</th>
                <th class="bg-base-200/50">Email</th>
                <th class="bg-base-200/50">Role</th>
                <th class="bg-base-200/50">Joined</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-neutral text-neutral-content rounded-full w-10">
                        <span class="text-lg">{{ getUserInitials(user) }}</span>
                      </div>
                    </div>
                    <div>
                      <div class="font-bold">{{ user.first_name }} {{ user.last_name }}</div>
                    </div>
                  </div>
                </td>
                <td class="text-sm">{{ user.email }}</td>
                <td>
                  <div class="dropdown dropdown-bottom">
                    <div tabindex="0" role="button" class="badge badge-outline gap-1 cursor-pointer">
                      {{ user.role }}
                      <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                      <li v-for="role in availableRoles" :key="role">
                        <a 
                          :class="{ 'active': user.role === role }"
                          @click="updateUserRole(user.id, role)"
                        >
                          {{ role }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="text-sm">{{ formatDate(user.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Remove the unused style */
</style>