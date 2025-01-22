<!-- pages/dashboard/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Database } from '~/types/database'

definePageMeta({
  middleware: ['auth']
})

type ApplicationStatus = Database['public']['Enums']['app_application_status']

interface Application {
  id: string
  status: ApplicationStatus
  created_at: string | null
  user_id: string
  job_id: string | null
  feedback: string | null
  job: {
    id: string
    title: string
  } | null
}

const user = useSupabaseUser()
const supabase = useSupabaseClient<Database>()
const applications = ref<Application[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const updateApplicationStatus = async (application: Application, newStatus: ApplicationStatus) => {
  try {
    loading.value = true
    error.value = null

    const { error: updateError } = await supabase
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id)
      .select()
      .single()

    if (updateError) throw updateError

    // Update local state
    application.status = newStatus
    useToast().add({
      title: 'Success',
      description: 'Application status updated successfully',
      type: 'success'
    })
  } catch (err) {
    console.error('Error updating application status:', err)
    error.value = err instanceof Error ? err.message : 'Failed to update application status'
    useToast().add({
      title: 'Error',
      description: 'Failed to update application status',
      type: 'error'
    })
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  if (!user.value?.id) {
    error.value = 'User not authenticated'
    loading.value = false
    return
  }

  try {
    const { data, error: fetchError } = await supabase
      .from('applications')
      .select(`
        id, 
        status, 
        created_at, 
        user_id, 
        job_id,
        feedback,
        job:jobs (
          id,
          title
        )
      `)
      .eq('user_id', user.value.id)
      .limit(5)
      .order('created_at', { ascending: false })
    
    if (fetchError) throw fetchError
    
    applications.value = (data || [])
      .filter((app): app is Omit<typeof app, 'status'> & { status: ApplicationStatus } => 
        app.status !== null && app.id !== null && app.user_id !== null
      ) as Application[]
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
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    <p v-if="user" class="text-lg mb-8">Welcome, {{ user.email }}</p>
    
    <div class="mt-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Recent Applications</h2>
        <NuxtLink to="/dashboard/applications" class="btn btn-primary btn-sm">
          View All
        </NuxtLink>
      </div>

      <div v-if="loading" class="flex justify-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>

      <div v-else-if="error" class="alert alert-error mb-6">
        {{ error }}
      </div>
      
      <div v-else-if="applications.length === 0" class="text-center py-8 text-base-content/60">
        No applications found. 
        <NuxtLink to="/jobs" class="link link-primary">Browse available positions</NuxtLink>
      </div>
      
      <div v-else class="space-y-4">
        <div v-for="application in applications" :key="application.id"
          class="p-4 bg-white rounded-lg shadow">
          <div class="flex flex-col gap-4">
            <!-- Header with title and status -->
            <div class="flex justify-between items-center">
              <h3 class="font-semibold">{{ application.job?.title || 'Unknown Position' }}</h3>
              <span class="badge" :class="{
                'badge-warning': application.status === 'pending',
                'badge-info': ['screening', 'interview', 'technical_assessment'].includes(application.status),
                'badge-primary': application.status === 'offer',
                'badge-success': application.status === 'accepted',
                'badge-error': ['rejected', 'withdrawn'].includes(application.status)
              }">
                {{ application.status }}
              </span>
            </div>

            <!-- Application details -->
            <div>
              <p class="text-sm text-base-content/60">
                Applied: {{ new Date(application.created_at || '').toLocaleDateString() }}
              </p>
              <div v-if="application.feedback" class="mt-2 p-3 bg-base-200 rounded text-sm">
                <p class="font-semibold mb-1">Feedback:</p>
                <p class="whitespace-pre-wrap">{{ application.feedback }}</p>
              </div>
            </div>

            <!-- Action Buttons -->
            <div v-if="!['accepted', 'rejected', 'withdrawn'].includes(application.status)" 
              class="flex gap-2 justify-end">
              <!-- Accept/Decline Offer -->
              <template v-if="application.status === 'offer'">
                <button 
                  @click="updateApplicationStatus(application, 'accepted')"
                  class="btn btn-success btn-sm"
                >
                  Accept Offer
                </button>
                <button 
                  @click="updateApplicationStatus(application, 'rejected')"
                  class="btn btn-error btn-sm"
                >
                  Decline Offer
                </button>
              </template>

              <!-- Withdraw Application -->
              <button 
                v-else
                @click="updateApplicationStatus(application, 'withdrawn')"
                class="btn btn-error btn-sm"
              >
                Withdraw Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>