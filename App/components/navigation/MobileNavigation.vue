<!-- components/navigation/MobileNavigation.vue -->
<template>
  <div class="drawer-side">
    <label for="my-drawer-3" class="drawer-overlay"></label>
    <div class="menu bg-base-200 w-80 min-h-full">
      <div class="sticky top-0 bg-base-200 z-20 p-3 border-b border-base-300">
        <NuxtLink to="/" class="text-xl font-bold">{{ logoText }}</NuxtLink>
      </div>
      
      <div class="px-2 py-2">
        <ul class="menu menu-sm">
          <template v-if="navItems">
            <li v-for="item in navItems" :key="item.to">
              <NuxtLink 
                :to="item.to"
                class="py-2"
                :class="{ 'text-primary font-medium': isExactRouteActive(item.to) }"
                @click="closeDrawer"
              >
                <i :class="item.icon" class="mr-2"></i>
                {{ item.label }}
              </NuxtLink>
            </li>
          </template>
        </ul>
      </div>

      <div class="sticky bottom-0 bg-base-200 p-3 border-t border-base-300 mt-auto">
        <ClientOnly>
          <template v-if="user">
            <UserMenu position="top-left" />
          </template>
          <template v-else>
            <NuxtLink to="/auth/login" class="btn btn-primary w-full" @click="closeDrawer">
              Login
            </NuxtLink>
          </template>
        </ClientOnly>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, onMounted, watch } from 'vue'
import { useSupabaseUser } from '#imports'
import type { NavItem } from '~/composables/useNav'

defineProps<{
  logoText: string
  navItems: NavItem[]
}>()

const user = useSupabaseUser()
const route = useRoute()
const drawerCheckbox = ref<HTMLInputElement | null>(null)

onMounted(() => {
  drawerCheckbox.value = document.getElementById('my-drawer-3') as HTMLInputElement
})

const closeDrawer = () => {
  if (drawerCheckbox.value) {
    drawerCheckbox.value.checked = false
  }
}

const isExactRouteActive = (path: string) => {
  return route.path === path
}

watch(() => route.path, closeDrawer)
</script>

<style scoped>
.collapse {
  position: relative;
}
</style>
