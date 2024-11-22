<!-- components/navigation/DesktopNavigation.vue -->
<template>
  <div class="flex-1 flex items-center justify-between">
    <div class="flex-1">
      <NuxtLink to="/" class="text-xl font-bold">{{ logoText }}</NuxtLink>
    </div>

    <div class="hidden lg:flex flex-none">
      <ul class="menu menu-horizontal px-1 gap-2">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink 
            :to="item.path"
            class="rounded-lg hover:bg-base-200"
            active-class="bg-primary text-white"
          >
            {{ item.name }}
          </NuxtLink>
        </li>
      </ul>
    </div>

    <div class="flex-none gap-2 hidden lg:block">
      <template v-if="user">
        <UserMenu :user="user" />
      </template>
      <template v-else>
        <NuxtLink to="/auth/login" class="btn btn-primary btn-sm">Login</NuxtLink>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  logoText: string
  navItems: NavItem[]
  user: any
}>()
</script>