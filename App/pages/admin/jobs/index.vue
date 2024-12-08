<!-- pages/admin/jobs/index.vue -->
<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Job } from '~/types/jobs'

definePageMeta({
  middleware: ['auth'],
  requiresRole: 'admin',
  layout: 'admin'
})

const supabase = useSupabaseClient()
const jobs = ref<Job[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Wait for client to be ready
const fetchJobs = async () => {
  if (!supabase) {
    console.error('Supabase client not initialized')
    return
  }

  try {
    loading.value = true
    const { data, error: fetchError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        description,
        department,
        location,
        status,
        created_by,
        created_at,
        updated_at,
        application_steps,
        meta,
        job_details
      `)
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    jobs.value = data as Job[] || []
  } catch (err) {
    const e = err as Error
    console.error('Error fetching jobs:', e)
    error.value = e.message
  } finally {
    loading.value = false
  }
}

const deleteJob = async (jobId: string) => {
  if (!confirm('Are you sure you want to delete this job?')) return

  try {
    const { error: deleteError } = await supabase
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) throw deleteError
    await fetchJobs()
  } catch (err) {
    const e = err as Error
    console.error('Error deleting job:', e)
    error.value = e.message
  }
}

onMounted(() => {
  fetchJobs()
})
</script>

<template>
  <div class="container mx-auto p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Jobs</h1>
      <NuxtLink to="/admin/jobs/new" class="btn btn-primary">
        Create Job
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center py-8">
      <span class="loading loading-spinner loading-lg"></span>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error">
      {{ error }}
    </div>

    <!-- Empty State -->
    <div v-else-if="!jobs.length" class="text-center py-8">
      <h3 class="font-semibold mb-2">No Jobs Found</h3>
      <p class="text-base-content/60 mb-4">Create your first job listing to get started</p>
      <NuxtLink to="/admin/jobs/new" class="btn btn-primary mt-4">
        Create Your First Job
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="job in jobs" 
           :key="job.id" 
           class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{{ job.title }}</h2>
          <p v-if="job.department" class="text-sm opacity-70">
            <i class="fas fa-building mr-2"></i>{{ job.department }}
          </p>
          <p v-if="job.location" class="text-sm opacity-70">
            <i class="fas fa-map-marker-alt mr-2"></i>{{ job.location }}
          </p>
          <div class="badge" :class="{
            'badge-primary': job.status === 'published',
            'badge-ghost': job.status === 'draft',
            'badge-error': job.status === 'closed'
          }">
            {{ job.status }}
          </div>
          <div class="divider my-2"></div>
          <div class="flex gap-2 justify-end">
            <button 
              @click="() => deleteJob(job.id)"
              class="btn btn-ghost btn-sm text-error"
            >
              <i class="fas fa-trash"></i>
            </button>
            <NuxtLink :to="`/admin/jobs/${job.id}`" class="btn btn-primary btn-sm">
              Edit
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>