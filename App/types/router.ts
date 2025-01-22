import type { Database } from './database'

type AppPermission = Database['public']['Enums']['app_permission']

declare module '#app' {
  interface PageMeta {
    auth?: {
      unauthenticatedOnly?: boolean
      navigateAuthenticatedTo?: string
    }
    permissions?: AppPermission[]
    public?: boolean
  }
} 