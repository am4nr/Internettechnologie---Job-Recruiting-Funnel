<template>
  <div class="min-h-screen lg:h-screen flex flex-col bg-gray-100">
    <Navigation 
      class="flex-none" 
      :logo-text="'Kistenkönige Logistik'"
      :nav-items="navItems"
      :user="user"
    />
    <MobileNavigation 
      :logo-text="'Kistenkönige Logistik'"
      :nav-items="navItems"
      :user="user"
    />
    <main class="flex-1 lg:overflow-hidden">
      <div class="container h-full mx-auto px-3 sm:px-6 lg:px-8 pt-2 pb-0 sm:pt-3">
        <div class="bg-white rounded-xl shadow-sm lg:h-full">
          <div class="lg:overflow-y-auto lg:h-full p-4 sm:p-6 lg:p-8">
            <NuxtPage />
          </div>
        </div>
      </div>
    </main>
    <Footer class="flex-none" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useNav } from '~/composables/useNav'
import { useSupabaseClient } from '#imports'
import Navigation from '~/components/navigation/Navigation.vue'
import MobileNavigation from '~/components/navigation/MobileNavigation.vue'
import Footer from '~/components/layout/Footer.vue'

const { navItems } = useNav()
const supabase = useSupabaseClient()
const user = ref(null)

onMounted(async () => {
  const { data: { user: authUser }, error } = await supabase.auth.getUser()
  if (error) {
    console.error('Error fetching user:', error.message)
    return
  }
  user.value = authUser
})

// Listen for auth state changes
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN') {
    const { data: { user: authUser }, error } = await supabase.auth.getUser()
    if (!error) {
      user.value = authUser
    }
  } else if (event === 'SIGNED_OUT') {
    user.value = null
  }
})
</script>

<style scoped>
@media (min-width: 1024px) {
  .overflow-y-auto::-webkit-scrollbar {
    width: 8px;
  }

  .overflow-y-auto::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 4px;
  }

  .overflow-y-auto::-webkit-scrollbar-thumb:hover {
    background: #a1a1a1;
  }

  .overflow-y-auto {
    scrollbar-width: thin;
    scrollbar-color: #c1c1c1 #f1f1f1;
  }
}
</style>