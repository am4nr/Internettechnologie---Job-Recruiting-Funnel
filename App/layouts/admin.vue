<template>
  <div class="min-h-screen bg-base-200">
    <!-- Admin Header -->
    <header class="bg-base-100 shadow sticky top-0 z-30">
      <div class="navbar container mx-auto px-4">
        <!-- Back to Site -->
        <div class="flex-1">
          <NuxtLink to="/" class="btn btn-ghost gap-2">
            <i class="fas fa-arrow-left"></i>
            Back to Site
          </NuxtLink>
        </div>

        <!-- Right Side -->
        <div class="flex-none gap-2">
          <UserMenu position="bottom-right" />
        </div>
      </div>
    </header>

    <!-- Admin Content -->
    <div class="container mx-auto px-4">
      <div class="flex gap-4 pt-6">
        <!-- Sidebar -->
        <aside class="w-48 shrink-0">
          <div class="bg-base-100 rounded-lg shadow">
            <nav class="p-3">
              <ul class="menu menu-lg">
                <li v-for="item in navItems" :key="item.path">
                  <NuxtLink :to="item.path">
                    <i :class="item.icon"></i>
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </nav>
          </div>
        </aside>

        <!-- Main Content -->
        <main class="flex-1 bg-base-100 rounded-lg shadow min-h-[calc(100vh-8rem)]">
          <slot />
        </main>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserMenu from '~/components/navigation/UserMenu.vue'
import { useAuthStore } from '~/stores/auth'
import { computed } from 'vue'

const authStore = useAuthStore()

// Compute permissions for different sections
const hasAdminPerms = computed(() => authStore.hasPermissions(['roles.read_all', 'roles.update_all']))
const hasJobManagementPerms = computed(() => authStore.hasPermissions([
  'jobs.create',
  'applications.read_all',
  'applications.change_status',
  'forms.read_all'
]))

// Navigation items based on permissions
const navItems = computed(() => {
  const items = [
    {
      name: 'Dashboard',
      path: '/admin',
      icon: 'fas fa-home'
    }
  ]

  // Job management items - available to both admins and recruiters
  if (hasJobManagementPerms.value || hasAdminPerms.value) {
    items.push(
      {
        name: 'Jobs',
        path: '/admin/jobs',
        icon: 'fas fa-briefcase'
      },
      {
        name: 'Applications',
        path: '/admin/applications',
        icon: 'fas fa-file-alt'
      },
      {
        name: 'Forms',
        path: '/admin/forms',
        icon: 'fas fa-file-lines'
      }
    )
  }

  // Admin-only items
  if (hasAdminPerms.value) {
    items.push(
      {
        name: 'Users',
        path: '/admin/users',
        icon: 'fas fa-users'
      },
      {
        name: 'Roles',
        path: '/admin/roles',
        icon: 'fas fa-user-shield'
      }
    )
  }

  return items
})
</script> 