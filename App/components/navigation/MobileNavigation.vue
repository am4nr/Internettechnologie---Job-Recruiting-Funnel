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
          <li v-for="(item, index) in navItems" :key="item.path">
            <template v-if="item.children">
              <div class="collapse" :class="{ 'collapse-open': openItems[index] }">
                <div class="collapse-title font-medium py-2 min-h-0 flex items-center gap-2 relative">
                  <div 
                    class="absolute left-0 w-8 h-full flex items-center justify-center cursor-pointer"
                    @click.stop="toggleItem(index)"
                  >
                    <i 
                      class="fas fa-chevron-right transform transition-transform" 
                      :class="{ 
                        'rotate-90': openItems[index],
                        'text-primary': isParentActive(item)
                      }"
                    ></i>
                  </div>
                  <NuxtLink 
                    :to="item.path"
                    class="pl-8 flex-grow"
                    :class="{ 'text-primary font-medium': isExactRouteActive(item.path) }"
                    @click="closeDrawer"
                  >
                    {{ item.name }}
                  </NuxtLink>
                </div>
                <div class="collapse-content pt-1">
                  <ul class="menu menu-sm">
                    <li v-for="child in item.children" :key="child.path">
                      <NuxtLink 
                        :to="child.path"
                        class="py-1.5 pl-4"
                        :class="{ 'text-primary font-medium': isExactRouteActive(child.path) }"
                        @click="closeDrawer"
                      >
                        {{ child.name }}
                      </NuxtLink>
                    </li>
                  </ul>
                </div>
              </div>
            </template>
            <NuxtLink 
              v-else 
              :to="item.path"
              class="py-2"
              :class="{ 'text-primary font-medium': isExactRouteActive(item.path) }"
              @click="closeDrawer"
            >
              {{ item.name }}
            </NuxtLink>
          </li>
        </ul>
      </div>

      <div class="sticky bottom-0 bg-base-200 p-3 border-t border-base-300 mt-auto">
        <template v-if="user">
          <UserMenu :user="user" position="top-left" />
        </template>
        <template v-else>
          <NuxtLink to="/auth/login" class="btn btn-primary w-full" @click="closeDrawer">
            Login
          </NuxtLink>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router'
import { ref, reactive } from 'vue'

defineProps<{
  logoText: string
  navItems: NavItem[]
  user: any
}>()

const route = useRoute()
const openItems = reactive<{ [key: number]: boolean }>({})
const drawerCheckbox = ref<HTMLInputElement | null>(null)

onMounted(() => {
  drawerCheckbox.value = document.getElementById('my-drawer-3') as HTMLInputElement
})

const toggleItem = (index: number) => {
  openItems[index] = !openItems[index]
}

const closeDrawer = () => {
  if (drawerCheckbox.value) {
    drawerCheckbox.value.checked = false
  }
}

const isExactRouteActive = (path: string) => {
  return route.path === path
}

const isRouteActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`)
}

const isParentActive = (item: { path: string, children?: Array<{ path: string }> }) => {
  return item.children?.some(child => isRouteActive(child.path)) || false
}

watch(() => route.path, closeDrawer)
</script>

<style scoped>
.collapse {
  position: relative;
}
</style>
