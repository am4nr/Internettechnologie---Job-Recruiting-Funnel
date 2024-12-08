<!-- components/navigation/MobileNavigation.vue -->
<template>
  <div class="drawer-side">
    <label for="my-drawer-3" class="drawer-overlay"></label>
    <div class="menu bg-base-200 min-h-full w-80 p-4 flex flex-col">
      <div class="mb-6 px-4">
        <NuxtLink to="/" class="text-xl font-bold">{{ logoText }}</NuxtLink>
      </div>
      
      <ul class="menu-list space-y-2">
        <li v-for="item in navItems" :key="item.path">
          <NuxtLink 
            :to="item.path" 
            class="flex items-center p-2 rounded-lg hover:bg-base-300"
            active-class="bg-primary text-white"
          >
            {{ item.name }}
          </NuxtLink>
          <ul v-if="item.children" class="pl-4 mt-2 space-y-1">
            <li v-for="child in item.children" :key="child.path">
              <NuxtLink 
                :to="child.path"
                class="flex items-center p-2 rounded-lg hover:bg-base-300"
                active-class="text-primary"
              >
                {{ child.name }}
              </NuxtLink>
            </li>
          </ul>
        </li>
      </ul>

      <div class="mt-auto p-4 border-t border-base-300">
        <template v-if="user">
          <UserMenu :user="user" position="top-left" />
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="btn btn-primary btn-sm w-full">
            Login
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'

defineProps<{
  logoText: string
  navItems: NavItem[]
  user: any
}>()

const route = useRoute()
const drawerCheckbox = ref<HTMLInputElement | null>(null)

onMounted(() => {
  drawerCheckbox.value = document.getElementById('my-drawer-3') as HTMLInputElement
})

watch(() => route.path, () => {
  if (drawerCheckbox.value) {
    drawerCheckbox.value.checked = false
  }
})
</script>
