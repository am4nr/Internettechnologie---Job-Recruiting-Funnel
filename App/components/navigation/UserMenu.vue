<!-- components/navigation/UserMenu.vue -->
<template>
  <div class="dropdown dropdown-top dropdown-start lg:dropdown-bottom lg:dropdown-end">
    <label tabindex="0" class="btn btn-primary btn-circle rounded-full flex items-center justify-center p-0">
      <div class="w-10 h-10 rounded-full flex items-center justify-center">
        <span v-if="!isLoading" class="text-lg font-semibold text-primary-content leading-none">
          {{ userInitial }}
        </span>
        <span v-else>...</span>
      </div>
    </label>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
      <div class="px-4 py-2 text-sm border-b border-base-200">
        <span class="font-medium text-base-content">{{ userEmail }}</span>
        <span class="block mt-1 text-xs text-base-content/70 capitalize">{{ currentRole }}</span>
        <span class="block mt-1 text-xs text-base-content/50 font-mono break-all">{{ userId }}</span>
      </div>
      
      <li><NuxtLink to="/dashboard/profile">Profile</NuxtLink></li>
      <li><NuxtLink to="/dashboard/settings">Settings</NuxtLink></li>
      <li><button @click="store.logout" :disabled="store.auth.value.isLoading">
        {{ store.auth.value.isLoading ? 'Logging out...' : 'Logout' }}
      </button></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'

const store = useSupabaseStore()
const isLoading = ref(true)

onMounted(async () => {
  try {
    await store.initialize()
    console.log('After init:', {
      user: store.auth.value.user,
      profile: store.auth.value.profile,
      role: store.auth.value.role
    })
  } finally {
    isLoading.value = false
  }
})

const userInitial = computed(() => {
  const email = store.auth.value?.user?.email || ''
  return email ? email.charAt(0).toUpperCase() : '?'
})

const userEmail = computed(() => 
  store.auth.value?.user?.email || ''
)

const currentRole = computed(() => 
  store.auth.value?.role || ''
)

const userId = computed(() => 
  store.auth.value?.user?.id || ''
)
</script>