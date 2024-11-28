// composables/useNav.ts
import { useRouter } from '#app'
import { computed } from 'vue'
import { useSupabaseStore } from './useSupabaseStore'

export interface NavItem {
  name: string
  path: string
  location?: 'navbar' | 'footer'
  children?: NavItem[]
}

export const useNav = () => {
  const store = useSupabaseStore()
  const router = useRouter()

  console.log('Nav setup:', { 
    isAuthenticated: store.auth.value.isAuthenticated,
    role: store.auth.value.role
  })

  const allNavItems = computed(() => {
    const items: NavItem[] = [
      // Public navbar items
      {
        name: 'Jobs',
        path: '/jobs',
        location: 'navbar',
        children: [
          { name: 'Search', path: '/jobs/search' },
          { name: 'Apply', path: '/jobs/apply' }
        ]
      },
      // Footer items
      {
        name: 'Company',
        path: '/company',
        location: 'footer',
        children: [
          { name: 'About', path: '/about' },
          { name: 'Imprint', path: '/about/imprint' }
        ]
      },
      {
        name: 'Legal',
        path: '/legal',
        location: 'footer',
        children: [
          { name: 'Privacy', path: '/legal/privacy' },
          { name: 'Terms', path: '/legal/terms' }
        ]
      }
    ]

    if (store.auth.value.isAuthenticated) {
      items.push({
        name: 'Dashboard',
        path: '/dashboard',
        location: 'navbar',
        children: [
          { name: 'Profile', path: '/dashboard/profile' },
          { name: 'Applications', path: '/dashboard/applications' }
        ]
      })

      if (store.auth.value.role === 'admin') {
        items.push({
          name: 'Admin',
          path: '/admin',
          location: 'navbar',
          children: [
            { name: 'Users', path: '/admin/users' },
            { name: 'Settings', path: '/admin/settings' }
          ]
        })
      }
    }

    return items
  })

  return {
    navItems: computed(() => allNavItems.value)
  }
}