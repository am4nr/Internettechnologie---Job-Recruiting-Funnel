import { useRouter, useRoute } from '#app'

interface NavItem {
  name: string
  path: string
  location?: 'navbar' | 'footer' // Optional since children inherit
  children?: Omit<NavItem, 'location'>[] // Children don't need location
  primary?: boolean
}

export const useNav = () => {
  const navItems: NavItem[] = [
    // Public Navbar Items
    {
      name: 'Jobs',
      path: '/jobs',
      location: 'navbar',
      children: [
        { name: 'Apply', path: '/jobs/apply' },
        { name: 'Personal', path: '/jobs/apply/personal' },
        { name: 'Preferences', path: '/jobs/apply/preferences' }
      ]
    },
    // Public Footer Items
    {
      name: 'About',
      path: '/about',
      location: 'footer',
      children: [
        { name: 'Imprint', path: '/about/imprint' }
      ]
    },
    // Auth Items
    {
      name: 'Dashboard',
      path: '/dashboard',
      location: 'navbar',
      children: [
        { name: 'Applications', path: '/dashboard/applications' },
        { name: 'Settings', path: '/dashboard/settings' }
      ]
    },
    // Guest Items
    { 
      name: 'Login / Register', 
      path: '/auth/login', 
      location: 'navbar',
      primary: true 
    }
  ]

  const filterByLocation = (items: NavItem[], location: 'navbar' | 'footer') =>
    items.filter(item => item.location === location)

  return {
    publicNavItems: filterByLocation(navItems.filter(item => 
      !item.path.startsWith('/auth') && 
      !item.path.startsWith('/dashboard')), 'navbar'),
    footerItems: filterByLocation(navItems, 'footer'),
    authenticatedNavItems: filterByLocation(navItems.filter(item =>
      item.path.startsWith('/dashboard')), 'navbar'),
    guestNavItems: filterByLocation(navItems.filter(item =>
      item.path.startsWith('/auth')), 'navbar')
  }
}