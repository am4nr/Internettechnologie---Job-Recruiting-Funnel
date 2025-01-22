// types/form.ts
import type { Database } from './database'
import type { Json } from './database'
import type { FormKitSchemaNode as BaseFormKitSchemaNode } from '@formkit/core'

// Define our custom schema node type
export interface FormKitSchemaNode {
  $formkit: string
  id?: string
  name?: string
  label?: string
  children?: FormKitSchemaNode[]
  options?: { label: string; value: string }[]
  validation?: string
  help?: string
  [key: string]: any // Allow any additional properties from FormKit
}

export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio'

export type ValidationRule = 'email' | 'phone' | 'github_url' | 'linkedin' | 'twitter' | 'website'

export interface FormFieldValidation {
  type: ValidationRule
  message?: string
}

export interface FormFieldOption {
  label: string
  value: string
}

export interface FormFieldOptions {
  [key: string]: any
  placeholder?: string
  rows?: number
  options?: FormFieldOption[]
  accept?: string
  multiple?: boolean
  min?: number
  max?: number
  step?: number
}

export interface FormField {
  id: string
  type: string
  name: string
  label: string
  $formkit?: string
  validation?: string
  placeholder?: string
  options?: { label: string, value: string }[]
}

export interface FormKitField {
  $formkit: FormFieldType
  name: string
  label: string
  help?: string
  validation?: string
  options?: FormFieldOptions
  [key: string]: any
}

export interface FormKitStep {
  $el: 'div'
  if?: string
  children: FormKitField[]
}

export interface FormStep {
  id: string
  title: string
  description?: string | null
  order_index: number
  is_conditional?: boolean
  condition_logic?: Record<string, any>
  created_at?: string
  updated_at?: string
}

export interface ApplicationStep {
  id: string
  title: string
  description: string | null | undefined
  fields: FormField[]
  order: number
}

type DbFormTemplate = Database['public']['Tables']['form_templates']['Row']
type DbJobForm = Database['public']['Tables']['job_forms']['Row']
type DbFormSubmission = Database['public']['Tables']['form_submissions']['Row']

export interface FormTemplate {
  id: string
  title: string
  description: string | null
  schema: FormField[]
  type: string | null
  is_active: boolean | null
  config?: any
  created_at: string | null
  updated_at: string | null
  created_by: string | null
  created_by_email?: string
}

export interface JobForm extends Omit<DbJobForm, 'template_id'> {
  template: {
    id: string
    title: string
    description: string | null
    schema: Json
    type: string | null
  }
}

export interface FormSubmission extends Omit<DbFormSubmission, 'job_id' | 'template_id'> {
  job: {
    id: string
    title: string
    description?: string | null
  }
  template: {
    id: string
    title: string
    description?: string | null
    schema?: Json
  }
}

export interface PaginationParams {
  page_size?: number
  page_number?: number
}

export interface SearchParams extends PaginationParams {
  search_query?: string
  template_type?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    total: number
    page_size: number
    page_number: number
    total_pages: number
  }
}

// RPC Function Response Types
export interface RPCFormTemplateResponse extends FormTemplate {}

export interface RPCJobFormResponse extends JobForm {}

export interface RPCFormSubmissionResponse extends FormSubmission {}

export interface RPCPaginatedResponse<T> extends PaginatedResponse<T> {}

export type Job = Database['public']['Tables']['jobs']['Row']
export type Form = Database['public']['Tables']['forms']['Row']