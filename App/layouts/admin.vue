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
                <li>
                  <NuxtLink to="/admin">
                    <i class="fas fa-home"></i>
                    Dashboard
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/admin/jobs">
                    <i class="fas fa-briefcase"></i>
                    Jobs
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/admin/applications">
                    <i class="fas fa-file-alt"></i>
                    Applications
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/admin/users">
                    <i class="fas fa-users"></i>
                    Users
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/admin/roles">
                    <i class="fas fa-user-shield"></i>
                    Roles
                  </NuxtLink>
                </li>
                <li>
                  <NuxtLink to="/admin/forms">
                    <i class="fas fa-file-lines"></i>
                    Forms
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
</script> 