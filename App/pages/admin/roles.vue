<!-- pages/admin/roles.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'

definePageMeta({
  middleware: ['auth'],
  requiresRole: 'admin'
})

const store = useSupabaseStore()
const loading = ref(true)
const roles = ref([])
const permissions = ref([])
const newRole = ref('')
const selectedRole = ref(null)

// Fetch roles and permissions
onMounted(async () => {
  try {
    const { data: rolesData, error: rolesError } = await store.supabase
      .from('roles')
      .select('*')
    
    if (rolesError) throw rolesError
    roles.value = rolesData

    const { data: permsData, error: permsError } = await store.supabase
      .from('role_permissions')
      .select('role, permission')
    
    if (permsError) throw permsError
    permissions.value = permsData
  } finally {
    loading.value = false
  }
})

// Role management
const createRole = async () => {
  try {
    loading.value = true
    const { error } = await store.supabase
      .from('roles')
      .insert({ name: newRole.value })
    
    if (error) throw error
    newRole.value = ''
  } catch (error) {
    console.error('Failed to create role:', error)
  } finally {
    loading.value = false
  }
}

const updateRolePermissions = async (role: string, permission: string, enabled: boolean) => {
  try {
    loading.value = true
    if (enabled) {
      await store.supabase
        .from('role_permissions')
        .insert({ role, permission })
    } else {
      await store.supabase
        .from('role_permissions')
        .delete()
        .match({ role, permission })
    }
  } catch (error) {
    console.error('Failed to update permissions:', error)
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Role Management</h1>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center p-8">
      <div class="loading loading-spinner text-primary"></div>
    </div>

    <div v-else class="space-y-6">
      <!-- Create New Role -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title">Create New Role</h2>
          <div class="flex gap-4">
            <input 
              v-model="newRole"
              type="text"
              placeholder="Role name"
              class="input input-bordered flex-1"
            />
            <button 
              @click="createRole"
              class="btn btn-primary"
              :disabled="!newRole"
            >
              Create
            </button>
          </div>
        </div>
      </div>

      <!-- Role List -->
      <div class="card bg-base-100 shadow-xl">
        <div class="card-body">
          <h2 class="card-title mb-4">Roles & Permissions</h2>
          
          <div class="overflow-x-auto">
            <table class="table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>roles.create</th>
                  <th>roles.read_all</th>
                  <th>roles.update_all</th>
                  <th>roles.delete_all</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="role in roles" :key="role.name">
                  <td>{{ role.name }}</td>
                  <td v-for="perm in ['roles.create', 'roles.read_all', 'roles.update_all', 'roles.delete_all']" 
                      :key="perm">
                    <input 
                      type="checkbox"
                      :checked="permissions.some(p => p.role === role.name && p.permission === perm)"
                      @change="e => updateRolePermissions(role.name, perm, e.target.checked)"
                      class="checkbox checkbox-primary"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>