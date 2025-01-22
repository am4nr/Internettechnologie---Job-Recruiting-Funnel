// types/auth.ts
import type { User } from '@supabase/supabase-js'
import type { Database } from './database'

export type AppRole = 'admin' | 'recruiter' | 'applicant'

export type AppPermission = Database['public']['Enums']['app_permission']

export interface UserProfile {
  id: string
  email: string
  first_name?: string | null
  last_name?: string | null
  created_at?: string
  updated_at?: string
}

export interface UserWithRole extends UserProfile {
  role: AppRole
  permissions: AppPermission[]
}

export interface DashboardData {
  total_applications: number
  pending_reviews: number
  recent_applications: {
    id: string
    job_title: string
    applicant_name: string
    status: string
    submitted_at: string
  }[]
  active_applications?: number
  completed_applications?: number
  recent_activity?: {
    id: string
    job_title: string
    status: string
    updated_at: string
  }[]
}

export interface JobDetails {
  tasks: string[]
  requirements: string[]
  benefits: string[]
  [key: string]: unknown
}

export interface Job {
  id: string
  title: string
  description: string
  location: string
  department: string
  status: string
  job_details: JobDetails
  created_at: string
  updated_at: string
  form_id?: string
  application_steps?: unknown[]
  meta?: Record<string, unknown>
}

export interface Role {
  name: string
  permissions: AppPermission[]
}

export interface Application {
  id: string
  user_id: string
  job_id: string
  status: Database['public']['Enums']['app_application_status']
  created_at: string
  updated_at: string
  responses: any[]
}