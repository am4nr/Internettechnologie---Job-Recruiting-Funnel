import type { Database } from '~/types/database'
import type { FormKitGroupValue } from '@formkit/core'
import { useSupabaseClient, useSupabaseUser } from '#imports'

export interface CreateApplicationData {
  job_id: string
  form_data: FormKitGroupValue
  status: Database['public']['Enums']['app_application_status']
}

export const useApplications = () => {
  const supabase = useSupabaseClient<Database>()
  const user = useSupabaseUser()

  // Create a new application
  const createApplication = async (data: CreateApplicationData) => {
    if (!user.value?.id) throw new Error('User not authenticated')

    const { error } = await supabase
      .from('applications')
      .insert({
        job_id: data.job_id,
        user_id: user.value.id,
        status: data.status,
        position: 'Applied via form',
        feedback: JSON.stringify({
          form_data: data.form_data
        })
      } as Database['public']['Tables']['applications']['Insert'])

    if (error) throw error
  }

  return {
    createApplication
  }
} 