<!-- components/navigation/NavigationMenu.vue -->
<template>
  <div :class="[
    'fixed md:static inset-x-0 top-16 md:top-0',
    'bg-white md:bg-transparent',
    'transform transition-all duration-300 ease-in-out',
    'min-h-screen md:min-h-0',
    'p-4 md:p-0',
    'md:flex md:items-center md:space-x-4',
    isOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'
  ]">
    <div class="flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
      <!-- Debug info -->
      <div class="text-xs text-gray-500 md:hidden">
        Items count: {{ items.length }}
      </div>

      <!-- Nav Items -->
      <template v-for="item in items" :key="item.path">
        <!-- Regular Nav Item -->
        <NavigationItem 
          v-if="!item.children"
          :to="item.path"
          :is-active="currentPath === item.path"
          @click="$emit('close')"
        >
          {{ item.name }}
        </NavigationItem>

        <!-- Dropdown Nav Item -->
        <NavigationDropdown
          v-else
          :label="item.name"
          class="relative group"
        >
          <NavigationItem
            v-for="child in item.children"
            :key="child.path"
            :to="child.path"
            :is-active="currentPath === child.path"
            @click="$emit('close')"
          >
            {{ child.name }}
          </NavigationItem>
        </NavigationDropdown>
      </template>

      <!-- User Menu -->
      <UserMenuDropdown v-if="authState.isAuthenticated" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface NavItem {
  name: string
  path: string
  children?: NavItem[]
}

// Move imports to top
import { useAuthState } from '~/composables/useAuthState'
import UserMenuDropdown from './UserMenuDropdown.vue'

const authState = useAuthState()

defineProps<{
  isOpen: boolean
  items: NavItem[]
  currentPath: string
}>()

defineEmits<{
  close: []
}>()
</script>