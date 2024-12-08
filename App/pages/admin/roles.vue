<!-- pages/admin/roles.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'
import type { Role } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const store = useSupabaseStore()
const loading = ref(false)
const error = ref<string | null>(null)
const roles = ref<Role[]>([])

// Load roles on page mount
onMounted(async () => {
  loading.value = true
  try {
    const { data, error: fetchError } = await store.fetchRoles()
    if (fetchError) throw fetchError
    roles.value = data || []
  } catch (err: any) {
    error.value = err.message
    console.error('Error loading roles:', err)
  } finally {
    loading.value = false
  }
})

// Permission groups
const permissionGroups = {
  profiles: {
    title: 'User Profiles',
    permissions: [
      { name: 'profiles.create', label: 'Create Profiles' },
      { name: 'profiles.read_own', label: 'View Own Profile' },
      { name: 'profiles.read_all', label: 'View All Profiles' },
      { name: 'profiles.update_own', label: 'Edit Own Profile' },
      { name: 'profiles.update_all', label: 'Edit All Profiles' },
      { name: 'profiles.delete_own', label: 'Delete Own Profile' },
      { name: 'profiles.delete_all', label: 'Delete All Profiles' }
    ]
  },
  applications: {
    title: 'Applications',
    permissions: [
      { name: 'applications.create', label: 'Create Applications' },
      { name: 'applications.read_own', label: 'View Own Applications' },
      { name: 'applications.read_all', label: 'View All Applications' },
      { name: 'applications.update_own', label: 'Edit Own Applications' },
      { name: 'applications.update_all', label: 'Edit All Applications' },
      { name: 'applications.delete_own', label: 'Delete Own Applications' },
      { name: 'applications.delete_all', label: 'Delete All Applications' },
      { name: 'applications.change_status', label: 'Change Application Status' }
    ]
  },
  jobs: {
    title: 'Jobs',
    permissions: [
      { name: 'jobs.create', label: 'Create Jobs' },
      { name: 'jobs.read_own', label: 'View Own Jobs' },
      { name: 'jobs.read_all', label: 'View All Jobs' },
      { name: 'jobs.update_own', label: 'Edit Own Jobs' },
      { name: 'jobs.update_all', label: 'Edit All Jobs' },
      { name: 'jobs.delete_all', label: 'Delete Jobs' },
      { name: 'jobs.publish', label: 'Publish Jobs' }
    ]
  },
  roles: {
    title: 'Roles',
    permissions: [
      { name: 'roles.create', label: 'Create Roles' },
      { name: 'roles.read_all', label: 'View Roles' },
      { name: 'roles.update_all', label: 'Edit Roles' },
      { name: 'roles.delete_all', label: 'Delete Roles' }
    ]
  },
  permissions: {
    title: 'Permissions',
    permissions: [
      { name: 'permissions.create', label: 'Create Permissions' },
      { name: 'permissions.read_all', label: 'View Permissions' },
      { name: 'permissions.update_all', label: 'Edit Permissions' },
      { name: 'permissions.delete_all', label: 'Delete Permissions' }
    ]
  },
  forms: {
    title: 'Forms',
    permissions: [
      { name: 'forms.create', label: 'Create Forms' },
      { name: 'forms.read_all', label: 'View Forms' },
      { name: 'forms.update_all', label: 'Edit Forms' },
      { name: 'forms.delete_all', label: 'Delete Forms' }
    ]
  }
}

// Toggle permission for a role
const togglePermission = async (role: Role, permission: string) => {
  const hasPermission = role.permissions.includes(permission)
  try {
    const { data, error: updateError } = await store.updateRolePermissions(role.name, permission, !hasPermission)
    if (updateError) throw updateError
    if (data) roles.value = data
  } catch (err: any) {
    error.value = err.message
    console.error('Error toggling permission:', err)
  }
}
</script>

<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Role Management</h1>
    
    <div v-if="loading" class="flex justify-center items-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-if="error" class="alert alert-error mb-6">
      {{ error }}
    </div>

    <div v-else-if="roles.length === 0" class="text-center py-8 text-gray-500">
      No roles found.
    </div>

    <div v-else class="grid gap-6">
      <div v-for="role in roles" :key="role.name" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold mb-4 capitalize">{{ role.name }}</h2>
        
        <div class="space-y-6">
          <div v-for="(group, key) in permissionGroups" :key="key" class="border-t pt-4 first:border-t-0 first:pt-0">
            <h3 class="font-semibold mb-3">{{ group.title }}</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div v-for="perm in group.permissions" :key="perm.name" class="flex items-center">
                <label class="inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    :checked="role.permissions.includes(perm.name)"
                    @change="togglePermission(role, perm.name)"
                    class="form-checkbox h-5 w-5 text-primary rounded border-gray-300 focus:ring-primary"
                  >
                  <span class="ml-2 text-sm">{{ perm.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>