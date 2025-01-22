import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'
import type { 
  FormTemplate as IFormTemplate, 
  FormField,
  PaginationParams,
  PaginatedResponse,
  RPCFormTemplateResponse,
  RPCPaginatedResponse 
} from '~/types/form'

interface SearchParams extends PaginationParams {
  search_query?: string
  template_type?: string
}

export { type FormField }

export function useFormTemplates() {
  const supabase = useSupabaseClient<Database>()

  // Create a new form template
  async function createTemplate(template: Omit<IFormTemplate, 'id' | 'created_at' | 'updated_at' | 'created_by'>) {
    const { data, error } = await supabase
      .rpc('manage_form_template', {
        template_data: {
          ...template,
          type: template.type || 'job_application',
          config: template.config || {},
          is_active: template.is_active ?? true
        },
        operation: 'create'
      })

    if (error) throw error
    return data as unknown as RPCFormTemplateResponse
  }

  // Update an existing template
  async function updateTemplate(template: Partial<IFormTemplate> & { id: string }) {
    const { data, error } = await supabase
      .rpc('manage_form_template', {
        template_data: template,
        operation: 'update'
      })

    if (error) throw error
    return data as unknown as RPCFormTemplateResponse
  }

  // Clone an existing template
  async function cloneTemplate(id: string) {
    const { data, error } = await supabase
      .rpc('manage_form_template', {
        template_data: { id },
        operation: 'clone'
      })

    if (error) throw error
    return data as unknown as RPCFormTemplateResponse
  }

  // Get templates with search and pagination
  async function getTemplates(params: SearchParams = {}) {
    const { data, error } = await supabase
      .rpc('get_form_templates', {
        search_query: params.search_query,
        template_type: params.template_type,
        page_size: params.page_size,
        page_number: params.page_number
      })

    if (error) throw error
    return data as unknown as RPCPaginatedResponse<IFormTemplate>
  }

  // Get a single template with creator info
  async function getTemplate(id: string) {
    const { data, error } = await supabase
      .rpc('get_form_template_by_id', {
        template_id: id
      })

    if (error) throw error
    return data as unknown as { 
      template: RPCFormTemplateResponse, 
      creator: { id: string, email: string } 
    }
  }

  return {
    createTemplate,
    updateTemplate,
    cloneTemplate,
    getTemplates,
    getTemplate
  }
} 
