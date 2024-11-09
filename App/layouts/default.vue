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
          <input type="checkbox" id="nav-toggle" class="hidden peer">
          <label for="nav-toggle" class="md:hidden cursor-pointer p-2">
            <div class="w-6 h-5 relative">
              <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300 
                           origin-center top-0 
                           peer-checked:rotate-45 peer-checked:top-1/2 peer-checked:-translate-y-1/2"></span>
              <span class="absolute w-full h-0.5 bg-gray-600 transition-opacity duration-300
                           top-1/2 -translate-y-1/2
                           peer-checked:opacity-0"></span>
              <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300
                           origin-center bottom-0
                           peer-checked:-rotate-45 peer-checked:bottom-1/2 peer-checked:translate-y-1/2"></span>
            </div>
          </label>

          <!-- Navigation Menu -->
          <div class="fixed md:relative top-16 md:top-0 left-0 w-full md:w-auto 
                      bg-white md:bg-transparent transform transition-transform duration-300 
                      translate-x-full peer-checked:translate-x-0 md:translate-x-0
                      h-[calc(100vh-4rem)] md:h-auto overflow-y-auto md:overflow-visible
                      p-4 md:p-0
                      flex flex-col md:flex-row items-start md:items-center">
            
            <!-- Public Navigation -->
            <div v-for="item in publicNavItems" :key="item.path" 
              class="relative group w-full md:w-auto"> <!-- Added w-full -->
              <NuxtLink v-if="!item.children" :to="item.path" 
                class="block md:inline-block hover:text-blue-600 px-3 py-2 w-full md:w-auto"<!-- Added w-full -->
                :class="{ 'text-blue-600': route.path === item.path }">
                {{ item.name }}
              </NuxtLink>
              
              <!-- Dropdown -->
              <div v-if="item.children" class="relative w-full md:w-auto"> <!-- Added w-full -->
                <input type="checkbox" :id="item.path" class="hidden peer">
                <label :for="item.path"
                  class="flex items-center justify-between w-full md:w-auto 
                         hover:text-blue-600 px-3 py-2 gap-1 cursor-pointer"
                  :class="{ 'text-blue-600': isActiveParent(item) }">
                  {{ item.name }}
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7"></path>
                  </svg>
                </label>
                
                <div class="max-h-0 md:max-h-none overflow-hidden transition-all duration-200
                           peer-checked:max-h-screen
                           md:absolute md:left-0 md:mt-0 md:w-48 md:bg-white md:rounded-md 
                           md:shadow-lg md:py-1 md:invisible md:opacity-0 
                           md:group-hover:visible md:group-hover:opacity-100">
                  <div class="pl-4 md:pl-0">
                    <NuxtLink v-for="child in item.children" :key="child.path"
                      :to="child.path"
                      class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      {{ child.name }}
                    </NuxtLink>
                  </div>
                </div>
              </div>
            </div>

            <!-- Authenticated Navigation -->
            <template v-if="user">
              <div v-for="item in authenticatedNavItems" :key="item.path"
                class="relative group">
                <!-- Same pattern as public nav -->
              </div>
              
              <!-- Logout Button -->
              <div class="flex flex-col items-start">
                <button @click="logout" 
                  class="text-red-600 hover:text-red-800 px-3 py-2">
                  <div class="flex flex-col">
                    <span>Logout</span>
                    <span v-if="userRole" class="text-xs text-gray-500">
                      {{ userRole }}
                    </span>
                  </div>
                </button>
              </div>
            </template>

            <!-- Guest Navigation -->
            <template v-else>
              <NuxtLink v-for="item in guestNavItems" :key="item.path"
                :to="item.path" 
                :class="[
                  item.primary ? 
                    'bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700' : 
                    'hover:text-blue-600 px-3 py-2'
                ]">
                {{ item.name }}
              </NuxtLink>
            </template>
          </div>
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
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const route = useRoute()

const { publicNavItems, authenticatedNavItems, guestNavItems, footerItems } = useNav()

// Add close menu function
const closeMenu = () => {
  const checkbox = document.getElementById('nav-toggle')
  if (checkbox) {
    checkbox.checked = false
  }
}

// Watch route changes to close menu
watch(route, () => {
  closeMenu()
})

// Add isActiveParent function
const isActiveParent = (item) => {
  if (!item.children) return false
  return item.children.some(child => 
    route.path === child.path || 
    route.path.startsWith(child.path + '/')
  )
}

const userRole = ref(null)

async function fetchUserRole() {
  if (user.value) {
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('id', user.value.id)
      .single()
    
    if (!error && data) {
      userRole.value = data.role
    }
  }
}

watch(user, () => {
  fetchUserRole()
}, { immediate: true })

async function logout() {
  try {
    await supabase.auth.signOut()
    router.push('/auth/login')
  } catch (error) {
    console.error(error)
  }
}
</script>