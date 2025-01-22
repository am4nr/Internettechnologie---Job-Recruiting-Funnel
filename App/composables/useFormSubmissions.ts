import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'
import type { 
  FormSubmission, 
  PaginationParams, 
  RPCFormSubmissionResponse, 
  RPCPaginatedResponse 
} from '~/types/form'

interface SearchParams extends PaginationParams {
  job_id?: string
  template_id?: string
  status?: string
}

export function useFormSubmissions() {
  const supabase = useSupabaseClient<Database>()

  // Get submissions with filtering and pagination
  async function getSubmissions(params: SearchParams = {}) {
    const { data, error } = await supabase
      .rpc('get_form_submissions', {
        job_id: params.job_id,
        template_id: params.template_id,
        status: params.status,
        page_size: params.page_size,
        page_number: params.page_number
      })

    if (error) throw error
    return data as unknown as RPCPaginatedResponse<FormSubmission>
  }

  // Get a single submission
  async function getSubmission(id: string) {
    const { data, error } = await supabase
      .rpc('get_submission_by_id', {
        submission_id: id
      })

    if (error) throw error
    return data as unknown as RPCFormSubmissionResponse
  }

  // Submit a form
  async function submitForm(
    jobFormId: string, 
    formData: Record<string, any>,
    files?: Array<{ name: string, url: string }>
  ) {
    const { data, error } = await supabase
      .rpc('submit_form', {
        job_form_id: jobFormId,
        form_data: formData,
        files: files || null
      })

    if (error) throw error
    return data as unknown as RPCFormSubmissionResponse
  }

  return {
    getSubmissions,
    getSubmission,
    submitForm
  }
} 
