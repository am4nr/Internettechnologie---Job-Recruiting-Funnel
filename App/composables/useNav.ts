import { useRouter, useRoute } from '#app'
import { computed } from 'vue'
import { useAuthState } from './useAuthState'

interface NavItem {
  name: string
  path: string
  location?: 'navbar' | 'footer'
  children?: Omit<NavItem, 'location'>[]
  primary?: boolean
}

export const useNav = () => {
  const { isAuthenticated, userRole } = useAuthState()
  const router = useRouter()

  // Add navigation guard
  router.beforeEach((to, from, next) => {
    console.log('Navigation:', { to, from })
    if (!isAuthenticated.value && to.path === '/jobs/search') {
      next('/auth/login')
    } else {
      next()
    }
  })
  
  console.log('Auth state:', {
    isAuthenticated: isAuthenticated.value,
    userRole: userRole.value
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
          { name: 'Contact', path: '/contact' }
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

    if (isAuthenticated.value) {
      items.push({
        name: 'Dashboard',
        path: '/dashboard',
        location: 'navbar',
        children: [
          { name: 'Profile', path: '/dashboard/profile' },
          { name: 'Applications', path: '/dashboard/applications' }
        ]
      })

      if (userRole.value === 'admin') {
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

  // Filter helpers
  const filterByLocation = (location: 'navbar' | 'footer') => 
    allNavItems.value.filter(item => item.location === location)

  const debugNavItems = computed(() => {
    const items = filterByLocation('navbar')
    console.log('Filtered navbar items:', items)
    return items
  })

  return {
    navItems: debugNavItems,
    footerItems: computed(() => filterByLocation('footer')),
    allNavItems,
    // Add isAuthenticated for components
    isAuthenticated,
    userRole
  }
}