<!-- components/navigation/UserMenu.vue -->
<template>
  <div class="dropdown dropdown-top dropdown-start lg:dropdown-bottom lg:dropdown-end">
    <label tabindex="0" class="btn btn-ghost btn-circle flex items-center justify-center p-0">
      <div class="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
        <span class="text-lg font-semibold text-primary-content leading-none">
          {{ userInitial }}
        </span>
      </div>
    </label>
    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-[1] w-52 p-2 shadow">
      <!-- User Role Display -->
      <div class="px-4 py-2 text-sm border-b border-base-200">
        <span class="font-medium text-base-content">{{ email }}</span>
        <span class="block mt-1 text-xs text-base-content/70 capitalize">{{ userRole }}</span>
        <span class="block mt-1 text-xs text-base-content/50 font-mono break-all">{{ uuid }}</span>
      </div>
      
      <li><NuxtLink to="/dashboard/profile">Profile</NuxtLink></li>
      <li><NuxtLink to="/dashboard/settings">Settings</NuxtLink></li>
      <li><button @click="logout">Logout</button></li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { User } from '@supabase/supabase-js'

const props = defineProps<{
  user: User
}>()

const { email, userRole, uuid, logout } = useAuthState()

const userInitial = computed(() => {
  return props.user?.email?.charAt(0).toUpperCase() || '?'
})

</script>

<style scoped>
/* Any additional styles if needed */
</style>