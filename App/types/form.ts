// types/form.ts
export type FormFieldType = 'text' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'range' | 'toggle'

export type ValidationRule = {
  type: 'none' | 'email' | 'phone' | 'github_url' | 'linkedin' | 'twitter' | 'website'
  message?: string
  pattern?: string
  min?: number
  max?: number
}

export interface FormFieldOption {
  label: string
  value: string | number
}

export interface FormFieldOptions {
  placeholder?: string
  rows?: number
  choices?: FormFieldOption[]
  accept?: string
  maxSize?: number
  min?: number
  max?: number
  step?: number
  multiple?: boolean
}

export interface FormFieldCondition {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
  value: string | number | boolean
}

export interface StepCondition {
  field: string
  operator: 'equals' | 'notEquals' | 'contains' | 'notContains' | 'greaterThan' | 'lessThan'
  value: string | number | boolean
}

export interface FormField {
  id: string
  type: FormFieldType
  label: string
  description?: string
  required?: boolean
  options?: FormFieldOptions
  validation: ValidationRule
  order: number
  conditions?: FormFieldCondition[]
}

export interface ApplicationStep {
  id: string
  title: string
  description?: string
  fields: FormField[]
  order: number
  conditions?: StepCondition[]
}

export interface FormTemplate {
  id: string
  title: string
  description?: string
  is_active: boolean
  steps: ApplicationStep[]
  created_at?: string
  updated_at?: string
  meta?: Record<string, any>
}