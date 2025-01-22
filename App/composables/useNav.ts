// composables/useNav.ts
import { /* useRouter, */ computed, onMounted, ref } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseUser } from '#imports'

export interface NavItem {
  label: string
  to: string
  icon: string
}

export interface FooterSection {
  title: string
  items: {
    label: string
    to: string
  }[]
}

export const useNav = () => {
  const authStore = useAuthStore()
  const user = useSupabaseUser()
  // const router = useRouter() // Removed unused variable
  const permissionsLoaded = ref(false)

  // Fetch permissions on mount if user is authenticated
  onMounted(async () => {
    if (user.value) {
      await authStore.fetchPermissions()
      permissionsLoaded.value = true
    }
  })

  const navItems = computed<NavItem[]>(() => {
    // Always show these items
    const items: NavItem[] = [
      {
        label: 'Home',
        to: '/',
        icon: 'fas fa-home'
      },
      {
        label: 'Jobs',
        to: '/jobs',
        icon: 'fas fa-briefcase'
      }
    ]

    // Add authenticated items
    if (user.value) {
      items.push({
        label: 'Dashboard',
        to: '/dashboard',
        icon: 'fas fa-tachometer-alt'
      })

      // Add admin link if user has required permissions
      if (permissionsLoaded.value) {
        const hasAdminPerms = authStore.hasPermissions(['roles.read_all', 'roles.update_all'])
        const hasJobManagementPerms = authStore.hasPermissions([
          'jobs.create',
          'applications.read_all',
          'applications.change_status',
          'forms.read_all'
        ])

        if (hasAdminPerms || hasJobManagementPerms) {
          items.push({
            label: 'Admin',
            to: '/admin',
            icon: 'fas fa-shield-alt'
          })
        }
      }
    }

    return items
  })

  const footerSections = computed<FooterSection[]>(() => [
    {
      title: 'Unternehmen',
      items: [
        { label: 'Über uns', to: '/about' },
        { label: 'Karriere', to: '/jobs' },
      ]
    },
    {
      title: 'Rechtliches',
      items: [
        { label: 'Impressum', to: '/about/imprint' },
        { label: 'Datenschutz', to: '/legal/privacy' },
        { label: 'AGB', to: '/legal/terms' }
      ]
    }
  ])

  return {
    navItems,
    footerSections,
    permissionsLoaded
  }
}