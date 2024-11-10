<template>
  <div class="min-h-screen flex flex-col">

    <!-- Navigation -->
    <nav class="bg-white shadow-sm z-50 relative">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">

          <!-- Logo -->
          <NuxtLink to="/" class="flex items-center font-bold">
            Job Portal
          </NuxtLink>

          <!-- Hamburger Menu -->
          <HamburgerButton
            v-model="isMenuOpen" 
            class="md:hidden"
          />

          <!-- Navigation Menu -->
          <NavigationMenu 
            :is-open="isMenuOpen"
            :items="navItems"
            :current-path="route.path"
            @close="isMenuOpen = false"
          />
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="flex-grow pt-8 px-4">
      <slot />
    </main>

    <!-- Footer -->
    <footer class="bg-gray-100 mt-12">
      <div class="container mx-auto px-4 py-8">
        <div class="flex flex-col md:flex-row justify-between">
          <!-- Company Info -->
          <div class="mb-6 md:mb-0">
            <h3 class="font-bold text-lg mb-4">Job Portal</h3>
            <p class="text-gray-600 max-w-sm">
              Find your next career opportunity with us.
            </p>
          </div>

          <!-- Footer Links -->
          <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
            <div v-for="item in footerItems" :key="item.path">
              <h4 class="font-semibold mb-4">{{ item.name }}</h4>
              <ul class="space-y-2">
                <li v-if="item.children" v-for="child in item.children" :key="child.path">
                  <NuxtLink :to="child.path" class="text-gray-600 hover:text-blue-600">
                    {{ child.name }}
                  </NuxtLink>
                </li>
                <li v-else>
                  <NuxtLink :to="item.path" class="text-gray-600 hover:text-blue-600">
                    {{ item.name }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <!-- Copyright -->
        <div class="border-t mt-8 pt-6 text-center text-gray-600">
          <p>&copy; {{ new Date().getFullYear() }} Job Portal. All rights reserved.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped>
/* Update or remove previous hamburger animation styles */
#nav-toggle:checked ~ label span:first-child {
  transform: translateY(-50%) rotate(45deg);
  top: 50%;
}

#nav-toggle:checked ~ label span:nth-child(2) {
  opacity: 0;
}

#nav-toggle:checked ~ label span:last-child {
  transform: translateY(50%) rotate(-45deg);
  bottom: 50%;
}

/* Desktop hover effects */
@media (min-width: 768px) {
  .group:hover .group-hover\:visible {
    visibility: visible;
  }

  .group:hover .group-hover\:opacity-100 {
    opacity: 1;
  }
}
</style>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useNav } from '~/composables/useNav'

const isMenuOpen = ref(false)
const route = useRoute()
const { navItems } = useNav()

// Close menu on route change
watch(route, () => {
  isMenuOpen.value = false
})

// Debug
console.log('Nav Items:', navItems.value)
</script>