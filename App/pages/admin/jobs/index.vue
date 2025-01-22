<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useSupabaseClient } from '#imports'
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database'

interface Job {
  id: string
  title: string
  description: string | null
  location: string | null
  status: Database['public']['Enums']['app_job_status']
  tasks: string | null
  requirements: string | null
  benefits: string | null
  form_id: string | null
  created_at: string | null
  updated_at: string | null
  created_by: string | null
}

definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const jobs = ref<Job[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

// Check individual permissions
const canCreateJobs = computed(() => 
  authStore.hasPermissions(['jobs.create'])
)

const canUpdateJobs = computed(() => 
  authStore.hasPermissions(['jobs.update_all'])
)

const canDeleteJobs = computed(() => 
  authStore.hasPermissions(['jobs.delete_all'])
)

const fetchJobs = async () => {
  try {
    loading.value = true
    const { data, error: fetchError } = await client
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
    
    if (fetchError) throw fetchError
    
    jobs.value = data || []
  } catch (err) {
    console.error('Error fetching jobs:', err)
    error.value = 'Failed to load jobs'
  } finally {
    loading.value = false
  }
}

const deleteJob = async (jobId: string) => {
  if (!canDeleteJobs.value) {
    error.value = 'You do not have permission to delete jobs'
    return
  }

  if (!confirm('Are you sure you want to delete this job?')) return

  try {
    const { error: deleteError } = await client
      .from('jobs')
      .delete()
      .eq('id', jobId)

    if (deleteError) throw deleteError
    await fetchJobs()
  } catch (err) {
    console.error('Error deleting job:', err)
    error.value = 'Failed to delete job'
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
      <NuxtLink 
        v-if="canCreateJobs"
        to="/admin/jobs/new" 
        class="btn btn-primary"
      >
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
      <NuxtLink 
        v-if="canCreateJobs"
        to="/admin/jobs/new" 
        class="btn btn-primary mt-4"
      >
        Create Your First Job
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div v-for="job in jobs" 
           :key="job.id" 
           class="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow">
        <div class="card-body">
          <h2 class="card-title">{{ job.title }}</h2>
          <p v-if="job.location" class="text-sm opacity-70">
            <i class="fas fa-map-marker-alt mr-2"></i>{{ job.location }}
          </p>
          <div class="badge" :class="{
            'badge-primary': job.status === 'published',
            'badge-ghost': job.status === 'draft',
            'badge-error': job.status === 'closed',
            'badge-secondary': job.status === 'archived'
          }">
            {{ job.status }}
          </div>
          <div class="divider my-2"></div>
          <div class="flex gap-2 justify-end">
            <button 
              v-if="canDeleteJobs"
              @click="() => deleteJob(job.id)"
              class="btn btn-ghost btn-sm text-error"
              aria-label="Delete job"
            >
              <i class="fas fa-trash"></i>
            </button>
            <NuxtLink 
              v-if="canUpdateJobs"
              :to="`/admin/jobs/${job.id}`" 
              class="btn btn-primary btn-sm"
            >
              Edit
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>