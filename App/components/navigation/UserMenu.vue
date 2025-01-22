<!-- components/navigation/UserMenu.vue -->
<template>
  <div class="dropdown" :class="dropdownClasses">
    <!-- Avatar Button -->
    <label 
      tabindex="0" 
      class="btn btn-circle btn-ghost"
      :class="{ 'loading': isLoading }"
    >
      <div 
        v-if="!isLoading && user" 
        class="avatar placeholder"
      >
        <div class="bg-neutral text-neutral-content rounded-full w-10">
          <span class="text-lg">{{ userInitial }}</span>
        </div>
      </div>
    </label>

    <!-- Dropdown Menu -->
    <ul v-if="user" tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg">
      <!-- User Info -->
      <div class="px-4 py-3 border-b border-base-200">
        <div class="flex items-center gap-3 mb-2">
          <div class="avatar placeholder">
            <div class="bg-neutral text-neutral-content rounded-full w-8">
              <span>{{ userInitial }}</span>
            </div>
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-base-content truncate">
              {{ userEmail }}
            </p>
            <p class="text-xs text-base-content/70 truncate">
              {{ currentRole }}
            </p>
          </div>
        </div>
        <div class="text-xs text-base-content/50 font-mono break-all">
          {{ userId }}
        </div>
      </div>

      <!-- Menu Items -->
      <template v-if="permissionsLoaded">
        <li v-if="hasAdminAccess">
          <NuxtLink to="/admin" class="flex items-center gap-2">
            <i class="fas fa-shield-alt text-base-content/70"></i>
            Admin Dashboard
          </NuxtLink>
        </li>
        <li>
          <NuxtLink to="/dashboard" class="flex items-center gap-2">
            <i class="fas fa-home text-base-content/70"></i>
            Dashboard
          </NuxtLink>
        </li>
        <div class="divider my-1"></div>
        <li>
          <button
            @click="handleLogout"
            class="flex items-center gap-2 text-error"
            :disabled="isLoggingOut"
          >
            <i class="fas fa-sign-out-alt"></i>
            <span v-if="isLoggingOut">Logging out...</span>
            <span v-else>Logout</span>
          </button>
        </li>
      </template>
      <template v-else>
        <li class="text-center py-2 text-base-content/50">
          <span class="loading loading-spinner loading-xs mr-2"></span>
          Loading...
        </li>
      </template>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useSupabaseUser, useSupabaseClient } from '#imports'
import { useAuthStore } from '~/stores/auth'

// Props
interface Props {
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right'
})

// State
const user = useSupabaseUser()
const client = useSupabaseClient()
const authStore = useAuthStore()
const isLoading = ref(false)
const isLoggingOut = ref(false)

// Computed
const dropdownClasses = computed(() => {
  switch (props.position) {
    case 'top-right': return 'dropdown-end dropdown-top'
    case 'top-left': return 'dropdown-start dropdown-top'
    case 'bottom-left': return 'dropdown-start dropdown-bottom'
    case 'bottom-right':
    default: return 'dropdown-end dropdown-bottom'
  }
})

const permissionsLoaded = computed(() => authStore.isInitialized.value)

const userInitial = computed(() => {
  const email = user.value?.email || ''
  return email ? email.charAt(0).toUpperCase() : '?'
})

const userEmail = computed(() => user.value?.email || 'Not logged in')
const userId = computed(() => user.value?.id || '')

// Permission checks
const hasAdminPerms = computed(() => 
  permissionsLoaded.value && authStore.hasPermissions(['roles.read_all', 'roles.update_all'])
)

const hasJobManagementPerms = computed(() => 
  permissionsLoaded.value && authStore.hasPermissions([
    'jobs.create',
    'applications.read_all',
    'applications.change_status',
    'forms.read_all'
  ])
)

const hasAdminAccess = computed(() => hasAdminPerms.value || hasJobManagementPerms.value)

const currentRole = computed(() => {
  if (!permissionsLoaded.value) return 'Loading...'
  if (hasAdminPerms.value) return 'Admin'
  if (hasJobManagementPerms.value) return 'Recruiter'
  return 'Applicant'
})

// Methods
const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await client.auth.signOut()
    // Reset auth store state
    authStore.permissions.value = []
    authStore.lastPermissionsFetch.value = 0
    // Redirect to homepage
    await navigateTo('/')
  } catch (err) {
    console.error('Logout error:', err)
  } finally {
    isLoggingOut.value = false
  }
}

// Lifecycle
onMounted(async () => {
  if (user.value) {
    await authStore.fetchPermissions(true)
  }
})
</script>