// types/auth.ts
import type { User } from '@supabase/supabase-js'
import type { Database } from './database'

export type AppRole = 'admin' | 'recruiter' | 'applicant'
export type AppPermission = string

export type UserProfile = Database['public']['Tables']['profiles']['Row']

export interface UserWithRole extends UserProfile {
  role: AppRole
  permissions: AppPermission[]
}

export interface Role {
  name: string
  permissions: AppPermission[]
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  responses: any[]
}