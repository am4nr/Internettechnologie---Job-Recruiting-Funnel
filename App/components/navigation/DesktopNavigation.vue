<!-- components/navigation/DesktopNavigation.vue -->
<template>
  <div class="flex-1 flex items-center justify-between">
    <div class="flex-1">
      <NuxtLink to="/" class="text-xl font-bold">{{ logoText }}</NuxtLink>
    </div>

    <div class="hidden lg:flex flex-none">
      <ul class="menu menu-horizontal px-1 gap-2">
        <template v-if="navItems">
          <li v-for="item in navItems" :key="item.to">
            <NuxtLink 
              :to="item.to"
              class="rounded-lg hover:bg-base-200"
              active-class="bg-primary text-white"
            >
              <i :class="item.icon" class="mr-2"></i>
              {{ item.label }}
            </NuxtLink>
          </li>
        </template>
      </ul>
    </div>

    <div class="flex-none gap-2 hidden lg:block">
      <ClientOnly>
        <template v-if="user">
          <UserMenu position="bottom-right" />
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
        </template>
      </ClientOnly>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSupabaseUser } from '#imports'
import type { NavItem } from '~/composables/useNav'

defineProps<{
  logoText: string
  navItems: NavItem[]
}>()

const user = useSupabaseUser()
</script>