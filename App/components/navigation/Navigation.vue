<!-- components/navigation/Navigation.vue -->
<template>
  <nav class="relative z-50">
    <div class="drawer drawer-end">
      <input id="my-drawer-3" type="checkbox" class="drawer-toggle" />
      <div class="drawer-content flex flex-col">
        <div class="navbar bg-base-200 w-full px-4 lg:px-8">
          <DesktopNavigation 
            :logo-text="logoText"
            :nav-items="navItems"
          />
          
          <!-- Hamburger Button -->
          <label for="my-drawer-3" class="p-2 cursor-pointer lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
              class="inline-block h-6 w-6 stroke-current">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </label>
        </div>
      </div>
      
      <MobileNavigation 
        :logo-text="logoText"
        :nav-items="navItems"
      />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useNav } from '~/composables/useNav'

defineProps<{
  logoText: string
}>()

const { navItems } = useNav()
</script>