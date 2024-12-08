// types/jobs.ts
import type { FormField } from './form'

export interface ApplicationStep {
  id: string
  title: string
  description?: string
  order: number
  fields: FormField[]
}

export interface Job {
  id: string
  title: string
  description: string
  company: string
  location: string
  salary_range?: string
  requirements?: string[]
  responsibilities?: string[]
  status: 'draft' | 'published' | 'closed'
  created_at: string
  updated_at: string
  application_steps: ApplicationStep[]
  meta?: Record<string, any>
}