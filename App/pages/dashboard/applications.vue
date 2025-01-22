<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Database } from '~/types/database'

definePageMeta({
  middleware: ['auth']
})

type ApplicationStatus = Database['public']['Enums']['app_application_status']

interface Application {
  id: string
  position: string
  status: ApplicationStatus
  created_at: string | null
  user_id: string
  job_id: string | null
  resume_url: string | null
}

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const applications = ref<Application[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  if (!user.value?.id) {
    error.value = 'User not authenticated'
    loading.value = false
    return
  }

  try {
    const { data, error: fetchError } = await supabase
      .from('applications')
      .select('id, position, status, created_at, user_id, job_id, resume_url')
      .eq('user_id', user.value.id)
    
    if (fetchError) throw fetchError
    
    // Filter out any applications with null status
    applications.value = (data || []).filter(
      (app): app is Application => app.status !== null && app.position !== null && app.id !== null && app.user_id !== null
    )
  } catch (err: any) {
    console.error('Error fetching applications:', err.message)
    error.value = err.message
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Your Applications</h1>
    
    <div v-if="loading" class="flex justify-center py-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <div v-else-if="error" class="alert alert-error mb-6">
      {{ error }}
    </div>
    
    <div v-else-if="applications.length === 0" class="text-center py-8 text-base-content/60">
      No applications found.
    </div>
    
    <div v-else class="space-y-4">
      <div v-for="application in applications" :key="application.id"
        class="p-4 bg-white rounded-lg shadow">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="font-semibold">{{ application.position }}</h3>
            <p class="text-sm text-base-content/60">
              Applied: {{ new Date(application.created_at || '').toLocaleDateString() }}
            </p>
          </div>
          <div>
            <span class="badge" :class="{
              'badge-warning': application.status === 'pending',
              'badge-info': application.status === 'screening',
              'badge-success': application.status === 'accepted',
              'badge-error': application.status === 'rejected'
            }">
              {{ application.status }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>