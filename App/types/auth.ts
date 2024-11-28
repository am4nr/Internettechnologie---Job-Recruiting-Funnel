// types/auth.ts
import type { User } from '@supabase/supabase-js'

export type AppRole = 'admin' | 'recruiter' | 'applicant' 

export interface UserProfile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  created_at: string
  updated_at: string
}

export interface Application {
  id: string
  user_id: string
  position: string
  status: string
  cover_letter: string | null
  resume_url: string | null
  created_at: string
}

export interface UserWithRole extends UserProfile {
  role: AppRole
  permissions: string[]
}