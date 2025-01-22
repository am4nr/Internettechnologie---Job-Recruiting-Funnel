<!-- pages/admin/roles.vue -->
<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseClient } from '#imports'
import type { AppPermission, Role } from '~/types/auth'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const client = useSupabaseClient()
const authStore = useAuthStore()
const roles = ref<Role[]>([])
const error = ref<string | null>(null)
const isLoading = ref(false)

const fetchRoles = async () => {
  try {
    isLoading.value = true
    const { data: rolePerms, error: permsError } = await client
      .from('role_permissions')
      .select('role, permission')

    if (permsError) throw permsError

    if (!rolePerms?.length) {
      roles.value = []
      return
    }

    // Get unique roles and their permissions
    const uniqueRoles = [...new Set(rolePerms.map(rp => rp.role))]
    roles.value = uniqueRoles.map(roleName => ({
      name: roleName,
      permissions: rolePerms
        .filter(rp => rp.role === roleName)
        .map(rp => rp.permission)
    }))
  } catch (err) {
    console.error('Error fetching roles:', err)
    error.value = 'Failed to load roles'
  } finally {
    isLoading.value = false
  }
}

const updateRolePermission = async (role: string, permission: AppPermission, enabled: boolean) => {
  try {
    if (enabled) {
      const { error } = await client
        .from('role_permissions')
        .insert({ role, permission })
      if (error) throw error
    } else {
      const { error } = await client
        .from('role_permissions')
        .delete()
        .match({ role, permission })
      if (error) throw error
    }
    await fetchRoles()
  } catch (err) {
    console.error('Error updating role permissions:', err)
    error.value = 'Failed to update role permissions'
  }
}

onMounted(async () => {
  await fetchRoles()
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
    const { data, error: updateError } = await updateRolePermission(role.name, permission, !hasPermission)
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
    
    <!-- Loading State -->
    <div v-if="isLoading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error Alert -->
    <div v-if="error" class="alert alert-error mb-6">
      <i class="fas fa-exclamation-circle mr-2"></i>
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="roles.length === 0" class="text-center py-8 text-base-content/60">
      No roles found.
    </div>

    <!-- Roles Grid -->
    <div v-else class="grid gap-6">
      <div v-for="role in roles" :key="role.name" class="collapse collapse-arrow bg-base-100 shadow-xl">
        <input type="checkbox" class="peer" /> 
        <div class="collapse-title card-title capitalize flex items-center">
          {{ role.name }}
          <div class="badge badge-primary ml-4">
            {{ role.permissions.length }} permissions
          </div>
        </div>
        <div class="collapse-content">
          <div class="space-y-6 pt-4">
            <div v-for="(group, key) in permissionGroups" :key="key" class="border-t border-base-200 pt-4 first:border-t-0 first:pt-0">
              <h3 class="font-semibold mb-3">{{ group.title }}</h3>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div v-for="perm in group.permissions" :key="perm.name" class="flex items-center">
                  <label class="label cursor-pointer justify-start gap-2">
                    <input
                      type="checkbox"
                      :checked="role.permissions.includes(perm.name)"
                      @change="togglePermission(role, perm.name)"
                      class="checkbox checkbox-primary checkbox-sm"
                    >
                    <span class="label-text">{{ perm.label }}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>