export interface Database {
  public: {
    Tables: {
      jobs: {
        Row: {
          id: string
          title: string
          description: string | null
          job_details: Record<string, any> | null
          status: 'draft' | 'published' | 'closed'
          created_by: string | null
          department: string | null
          location: string | null
          application_steps: any[]
          meta: Record<string, any> | null
          form_template_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['jobs']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['jobs']['Row']>
      }
      user_profiles: {
        Row: {
          id: string
          email: string
          first_name: string | null
          last_name: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_profiles']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['user_profiles']['Row']>
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: 'admin' | 'recruiter' | 'applicant'
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['user_roles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['user_roles']['Row']>
      }
      role_permissions: {
        Row: {
          id: string
          role: 'admin' | 'recruiter' | 'applicant'
          permission: string
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['role_permissions']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['role_permissions']['Row']>
      }
      applications: {
        Row: {
          id: string
          user_id: string
          job_id: string | null
          position: string
          status: 'pending' | 'reviewing' | 'accepted' | 'rejected'
          cover_letter: string | null
          resume_url: string | null
          current_step: string | null
          last_completed_step: string | null
          steps_data: Record<string, any> | null
          steps_validation: Record<string, any> | null
          submission_count: number | null
          feedback: Record<string, any> | null
          completed_at: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['applications']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['applications']['Row']>
      }
      form_templates: {
        Row: {
          id: string
          title: string
          description: string | null
          created_by: string | null
          is_active: boolean | null
          meta: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['form_templates']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['form_templates']['Row']>
      }
      form_steps: {
        Row: {
          id: string
          form_template_id: string | null
          title: string
          description: string | null
          order_index: number
          is_conditional: boolean | null
          condition_logic: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['form_steps']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['form_steps']['Row']>
      }
      form_fields: {
        Row: {
          id: string
          step_id: string | null
          type: string
          label: string
          description: string | null
          order_index: number
          is_required: boolean | null
          is_conditional: boolean | null
          condition_logic: Record<string, any> | null
          options: Record<string, any> | null
          validation_rules: Record<string, any> | null
          ui_options: Record<string, any> | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['form_fields']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['form_fields']['Row']>
      }
      field_dependencies: {
        Row: {
          id: string
          source_field_id: string | null
          target_field_id: string | null
          condition_type: string
          condition_value: Record<string, any>
          created_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['field_dependencies']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['field_dependencies']['Row']>
      }
    }
  }
}

export interface ApplicationStep {
  id: string
  title: string
  description: string
  type: 'form' | 'test' | 'interview'
  required: boolean
  order_index: number
  fields: any[]
} 