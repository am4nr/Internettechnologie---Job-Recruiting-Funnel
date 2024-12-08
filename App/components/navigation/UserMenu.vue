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
        v-if="!isLoading" 
        class="avatar placeholder"
      >
        <div class="bg-neutral text-neutral-content rounded-full w-10">
          <span class="text-lg">{{ userInitial }}</span>
        </div>
      </div>
    </label>

    <!-- Dropdown Menu -->
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-64 p-2 shadow-lg">
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
      <li v-if="isAdmin">
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
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'

interface Props {
  position?: 'bottom-right' | 'top-right' | 'bottom-left' | 'top-left'
}

const props = withDefaults(defineProps<Props>(), {
  position: 'bottom-right'
})

const dropdownClasses = computed(() => {
  switch (props.position) {
    case 'top-right':
      return 'dropdown-end dropdown-top'
    case 'top-left':
      return 'dropdown-start dropdown-top'
    case 'bottom-left':
      return 'dropdown-start dropdown-bottom'
    case 'bottom-right':
    default:
      return 'dropdown-end dropdown-bottom'
  }
})

const store = useSupabaseStore()
const isLoading = ref(false)
const isLoggingOut = ref(false)

const handleLogout = async () => {
  try {
    isLoggingOut.value = true
    await store.logout()
  } finally {
    isLoggingOut.value = false
  }
}

const userInitial = computed(() => {
  const email = store.auth.value?.user?.email || ''
  return email ? email.charAt(0).toUpperCase() : '?'
})

const userEmail = computed(() => 
  store.auth.value?.user?.email || 'Not logged in'
)

const currentRole = computed(() => {
  const role = store.auth.value?.role
  return role ? role.charAt(0).toUpperCase() + role.slice(1) : 'No role'
})

const userId = computed(() => 
  store.auth.value?.user?.id || ''
)

const isAdmin = computed(() => store.auth.value?.role === 'admin')
</script>