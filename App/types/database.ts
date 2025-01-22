export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      allowed_domains: {
        Row: {
          auto_confirm: boolean | null
          created_at: string | null
          domain: string
          id: string
        }
        Insert: {
          auto_confirm?: boolean | null
          created_at?: string | null
          domain: string
          id?: string
        }
        Update: {
          auto_confirm?: boolean | null
          created_at?: string | null
          domain?: string
          id?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          completed_at: string | null
          created_at: string | null
          feedback: string | null
          form_data: Json | null
          id: string
          job_id: string | null
          position: string
          status: Database["public"]["Enums"]["app_application_status"] | null
          updated_at: string | null
          updated_by: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          form_data?: Json | null
          id?: string
          job_id?: string | null
          position: string
          status?: Database["public"]["Enums"]["app_application_status"] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          feedback?: string | null
          form_data?: Json | null
          id?: string
          job_id?: string | null
          position?: string
          status?: Database["public"]["Enums"]["app_application_status"] | null
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_application_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_job"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      form_templates: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          schema: Json
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          schema?: Json
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          schema?: Json
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      forms: {
        Row: {
          config: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          schema: Json
          title: string
          type: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          schema?: Json
          title: string
          type?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          schema?: Json
          title?: string
          type?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      jobs: {
        Row: {
          benefits: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          form_id: string | null
          id: string
          location: string | null
          requirements: string | null
          status: Database["public"]["Enums"]["app_job_status"]
          tasks: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          benefits?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          form_id?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["app_job_status"]
          tasks?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          benefits?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          form_id?: string | null
          id?: string
          location?: string | null
          requirements?: string | null
          status?: Database["public"]["Enums"]["app_job_status"]
          tasks?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_form_id_fkey"
            columns: ["form_id"]
            isOneToOne: false
            referencedRelation: "forms"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string | null
          id: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          permission: Database["public"]["Enums"]["app_permission"]
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string | null
          id?: string
          permission?: Database["public"]["Enums"]["app_permission"]
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"] | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_role_user"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_application_feedback: {
        Args: {
          application_id: string
          step_name: string
          feedback_text: string
          feedback_status?: string
        }
        Returns: Json
      }
      authorize: {
        Args: {
          requested_permission: Database["public"]["Enums"]["app_permission"]
          resource_owner_id?: string
        }
        Returns: boolean
      }
      clone_form_template: {
        Args: {
          template_id: string
        }
        Returns: string
      }
      create_job_form: {
        Args: {
          job_id: string
          schema: Json
          config?: Json
        }
        Returns: Json
      }
      get_admin_activity: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          type: string
          description: string
          user_email: string
          created_at: string
        }[]
      }
      get_application_progress: {
        Args: {
          application_id: string
        }
        Returns: {
          total_steps: number
          completed_steps: number
          progress_percentage: number
          current_step: string
          next_step: string
        }[]
      }
      get_application_summary: {
        Args: {
          application_id: string
        }
        Returns: {
          application_status: Database["public"]["Enums"]["app_application_status"]
          days_since_submission: number
          last_update: string
          total_submissions: number
          is_complete: boolean
          feedback_count: number
        }[]
      }
      get_applications: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          created_at: string
          user_id: string
          job_id: string
          status: string
          resume_url: string
        }[]
      }
      get_dashboard_data: {
        Args: {
          user_id: string
          dashboard_type: string
        }
        Returns: Json
      }
      get_form_submissions: {
        Args: {
          job_id?: string
          template_id?: string
          status?: string
          page_size?: number
          page_number?: number
        }
        Returns: Json
      }
      get_form_template_by_id: {
        Args: {
          template_id: string
        }
        Returns: Json
      }
      get_form_templates: {
        Args: {
          search_query?: string
          template_type?: string
          page_size?: number
          page_number?: number
        }
        Returns: Json
      }
      get_job_forms: {
        Args: {
          job_id: string
        }
        Returns: Json
      }
      get_submission_by_id: {
        Args: {
          submission_id: string
        }
        Returns: Json
      }
      get_user_data: {
        Args: {
          user_id: string
        }
        Returns: Json
      }
      get_user_permissions: {
        Args: {
          user_id: string
        }
        Returns: {
          permissions: Database["public"]["Enums"]["app_permission"][]
        }[]
      }
      link_form_to_job: {
        Args: {
          job_id: string
          template_id: string
          config?: Json
        }
        Returns: Json
      }
      manage_form_template: {
        Args: {
          template_data: Json
          operation?: string
        }
        Returns: Json
      }
      manage_job: {
        Args: {
          job_data: Json
          user_id: string
        }
        Returns: Json
      }
      register_user: {
        Args: {
          email: string
          password: string
          first_name?: string
          last_name?: string
        }
        Returns: Json
      }
      submit_form: {
        Args: {
          job_form_id: string
          form_data: Json
          files?: Json
        }
        Returns: Json
      }
      update_all_user_claims: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_application_status:
        | "pending"
        | "screening"
        | "interview"
        | "technical_assessment"
        | "offer"
        | "accepted"
        | "rejected"
        | "withdrawn"
      app_job_status: "draft" | "published" | "closed" | "archived"
      app_permission:
        | "profiles.create"
        | "profiles.read_own"
        | "profiles.read_all"
        | "profiles.update_own"
        | "profiles.update_all"
        | "profiles.delete_own"
        | "profiles.delete_all"
        | "applications.create"
        | "applications.read_own"
        | "applications.read_all"
        | "applications.update_own"
        | "applications.update_all"
        | "applications.delete_own"
        | "applications.delete_all"
        | "roles.create"
        | "roles.read_all"
        | "roles.update_all"
        | "roles.delete_all"
        | "permissions.create"
        | "permissions.read_all"
        | "permissions.update_all"
        | "permissions.delete_all"
        | "jobs.create"
        | "jobs.read_all"
        | "jobs.read_own"
        | "jobs.update_all"
        | "jobs.update_own"
        | "jobs.delete_all"
        | "jobs.publish"
        | "applications.change_status"
        | "forms.create"
        | "forms.read_all"
        | "forms.update_all"
        | "forms.delete_all"
      app_role: "admin" | "recruiter" | "applicant"
      form_field_type:
        | "checkbox"
        | "file"
        | "radio"
        | "range"
        | "rating"
        | "select"
        | "text"
        | "textarea"
        | "toggle"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
