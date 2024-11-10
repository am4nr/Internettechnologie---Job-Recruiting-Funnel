<!-- components/navigation/UserMenuDropdown.vue -->
<template>
  <div>
    <NavigationDropdown 
      v-if="authState.isAuthenticated && user"
      :label="userEmail"
      class="order-last md:order-none"
    >
      <div class="py-1">
        <div v-if="authState.userRole" class="px-4 py-2 text-sm text-gray-500">
          Role: {{ authState.userRole }}
        </div>
        <hr class="my-1">
        <button
          @click="handleLogout"
          class="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
        >
          Logout
        </button>
      </div>
    </NavigationDropdown>

    <NuxtLink 
      v-else
      :to="ROUTES.AUTH.LOGIN"
      replace
      class="px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
    >
      Login / Register
    </NuxtLink>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthState } from '~/composables/useAuthState'
import { useRouter } from '#app'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import { ROUTES } from '~/constants/routes'

const authState = useAuthState()
const user = useSupabaseUser()
const router = useRouter()
const supabase = useSupabaseClient()

const userEmail = computed(() => user.value?.email || 'Account')

const handleLogout = async () => {
  try {
    await supabase.auth.signOut()
    await router.push(ROUTES.AUTH.LOGIN)
  } catch (error) {
    console.error('Logout error:', error)
  }
}
</script>