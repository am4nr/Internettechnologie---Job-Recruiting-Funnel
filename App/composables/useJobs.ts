import type { Job, JobInsert, JobUpdate } from '~/types/jobs'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'

export const useJobs = () => {
  const supabase = useSupabaseClient<Database>()

  // Get all jobs
  const getJobs = async () => {
    const { data: jobs, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        location,
        status,
        tasks,
        requirements,
        benefits,
        form_id,
        created_by,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return jobs as unknown as Job[]
  }

  // Get a job by ID
  const getJob = async (id: string) => {
    const { data: job, error } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        location,
        status,
        tasks,
        requirements,
        benefits,
        form_id,
        created_by,
        created_at,
        updated_at
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return job as unknown as Job
  }

  // Create a new job
  const createJob = async (job: JobInsert) => {
    const { data: newJob, error } = await supabase
      .from('jobs')
      .insert(job)
      .select()
      .single()

    if (error) throw error
    return newJob as unknown as Job
  }

  // Update a job
  const updateJob = async (id: string, job: JobUpdate) => {
    const { data: updatedJob, error } = await supabase
      .from('jobs')
      .update(job)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return updatedJob as unknown as Job
  }

  // Delete a job
  const deleteJob = async (id: string) => {
    const { error } = await supabase
      .from('jobs')
      .delete()
      .eq('id', id)

    if (error) throw error
  }

  return {
    getJobs,
    getJob,
    createJob,
    updateJob,
    deleteJob
  }
} 