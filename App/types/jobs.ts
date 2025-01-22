// types/jobs.ts
import type { Database } from './database'
import type { Form } from './form'

type DbJob = Database['public']['Tables']['jobs']['Row']

export interface Job extends DbJob {
  form?: Form
}

export type JobInsert = Database['public']['Tables']['jobs']['Insert']
export type JobUpdate = Database['public']['Tables']['jobs']['Update']

export interface FormKitGroupValue {
  [key: string]: any
}

export interface FormKitValidation {
  [key: string]: string | string[]
}