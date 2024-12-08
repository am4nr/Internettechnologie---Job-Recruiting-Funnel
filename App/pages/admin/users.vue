<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'
import type { UserWithRole } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const store = useSupabaseStore()
const loading = ref(false)
const error = ref<string | null>(null)
const users = ref<UserWithRole[]>([])

// Load users on page mount
onMounted(async () => {
  loading.value = true
  try {
    const { data, error: fetchError } = await store.fetchUsers()
    if (fetchError) throw fetchError
    users.value = data || []
  } catch (err: any) {
    error.value = err.message
    console.error('Error loading users:', err)
  } finally {
    loading.value = false
  }
})

// Available roles
const availableRoles = ['admin', 'recruiter', 'applicant']

// Update user role
const updateRole = async (user: UserWithRole, newRole: string) => {
  try {
    await store.updateUserRole(user.id, newRole as any)
  } catch (err: any) {
    error.value = err.message
    console.error('Error updating role:', err)
  }
}

// Get user initials
const getUserInitials = (user: UserWithRole) => {
  if (!user.first_name && !user.last_name) {
    return user.email.charAt(0).toUpperCase()
  }
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
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
                          @click="updateRole(user, role)"
                        >
                          {{ role }}
                        </a>
                      </li>
                    </ul>
                  </div>
                </td>
                <td class="text-sm">{{ new Date(user.created_at).toLocaleDateString() }}</td>
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