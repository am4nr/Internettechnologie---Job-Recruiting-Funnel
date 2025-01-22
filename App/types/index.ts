// Import from database.ts instead of database.types.ts
import type { Database } from './database'

// Export commonly used types
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]

// Explicitly define Job type to avoid circular dependencies
export interface Job {
  id: string
  title: string
  description: string | null
  location: string | null
  department: string | null
  status: Enums<'app_job_status'>
  job_details: Record<string, unknown> | null
  meta: Record<string, unknown> | null
  form_id: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}

// Other derived types
export type Application = Tables<'applications'>
export type UserProfile = Tables<'user_profiles'>
export type FormTemplate = Tables<'form_templates'>
