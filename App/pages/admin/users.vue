<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'

const store = useSupabaseStore()
const loading = ref(true)

// Fetch users on mount
onMounted(async () => {
  try {
    await store.fetchUsers()
  } finally {
    loading.value = false
  }
})

// Computed properties
const users = computed(() => store.users.value)
const canEditAll = computed(() => store.isAdmin.value)

// Role management
const updateUserRole = async (userId: string, newRole: string) => {
  try {
    loading.value = true
    await store.updateUserRole(userId, newRole as AppRole)
  } catch (error) {
    console.error('Failed to update role:', error)
    // TODO: Add error handling/notification
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="users-container p-4">
    <h1 class="text-2xl font-bold mb-4">User Management</h1>

    <div v-if="loading" class="loading-spinner flex justify-center items-center p-8">
      <div class="loading loading-spinner text-primary"></div>
    </div>

    <div v-else-if="users.length === 0" class="text-center p-8">
      No users found.
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="user in users" 
           :key="user.id" 
           class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <div class="user-info">
            <h3 class="card-title">{{ user.email }}</h3>
            <p>{{ user.first_name }} {{ user.last_name }}</p>
            <p class="text-sm opacity-70">
              Created: {{ new Date(user.created_at).toLocaleDateString() }}
            </p>
          </div>

          <div v-if="canEditAll" class="role-selector mt-4">
            <label class="label">Role:</label>
            <select 
              :value="user.role"
              @change="e => updateUserRole(user.id, e.target.value)"
              class="select select-bordered w-full"
            >
              <option value="admin">Admin</option>
              <option value="recruiter">Recruiter</option>
              <option value="applicant">Applicant</option>
            </select>
          </div>

          <div class="permissions-list mt-4" v-if="canEditAll">
            <h4 class="font-semibold mb-2">Permissions:</h4>
            <div class="flex flex-wrap gap-1">
              <span v-for="permission in user.permissions" 
                    :key="permission"
                    class="badge badge-sm">
                {{ permission }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.users-container {
  max-width: 1200px;
  margin: 0 auto;
}
</style>