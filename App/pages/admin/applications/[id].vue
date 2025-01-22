<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="border-b bg-base-100">
      <div class="px-6 py-4 flex justify-between items-center">
        <div>
          <h1 class="text-2xl font-bold">Application Details</h1>
          <p class="text-sm opacity-60">{{ application?.job?.title }}</p>
        </div>
        <NuxtLink to="/admin/applications" class="btn btn-ghost btn-sm gap-2">
          <i class="fas fa-arrow-left"></i>
          Back to Applications
        </NuxtLink>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex-1 flex justify-center items-center">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="alert alert-error m-6">
      {{ error }}
    </div>

    <!-- Content -->
    <div v-else-if="application" class="flex-1 overflow-auto p-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- Main Info -->
        <div class="md:col-span-2 space-y-6">
          <!-- Applicant Info -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title">Applicant Information</h2>
              <div class="flex items-center gap-4">
                <div class="avatar placeholder">
                  <div class="bg-neutral text-neutral-content rounded-full w-16">
                    <span class="text-xl">{{ getUserInitials(application.user) }}</span>
                  </div>
                </div>
                <div>
                  <h3 class="font-semibold">{{ getUserFullName(application.user) }}</h3>
                  <p class="text-sm opacity-60">{{ application.user?.email }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Application Data -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title">Application Data</h2>
              <div class="overflow-x-auto">
                <table class="table">
                  <tbody>
                    <tr v-for="(value, key) in application.form_data" :key="key">
                      <th class="capitalize">{{ formatKey(key) }}</th>
                      <td>{{ formatValue(value) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-6">
          <!-- Status Card -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title">Status</h2>
              <div class="dropdown dropdown-bottom w-full">
                <div 
                  tabindex="0" 
                  role="button" 
                  :class="{
                    'badge w-full py-4 text-center': true,
                    'cursor-pointer': canChangeStatus && !isFinalState(application.status),
                    'cursor-not-allowed': !canChangeStatus || isFinalState(application.status),
                    'badge-warning': application.status === 'pending',
                    'badge-info': application.status === 'screening' || application.status === 'interview' || application.status === 'technical_assessment',
                    'badge-primary': application.status === 'offer',
                    'badge-success': application.status === 'accepted',
                    'badge-error': application.status === 'rejected' || application.status === 'withdrawn'
                  }"
                >
                  {{ application.status }}
                  <i v-if="canChangeStatus && !isFinalState(application.status)" class="fas fa-chevron-down text-xs ml-2"></i>
                </div>
                <ul v-if="canChangeStatus && !isFinalState(application.status)" tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
                  <li v-for="status in availableStatuses" :key="status">
                    <a 
                      :class="{ 'active': application.status === status }"
                      @click="updateStatus(application, status)"
                    >
                      {{ status }}
                    </a>
                  </li>
                </ul>
              </div>
              <div class="text-sm opacity-60 mt-2">
                Last updated: {{ formatDate(application.updated_at) }}
              </div>
            </div>
          </div>

          <!-- Feedback Card -->
          <div class="card bg-base-100 shadow">
            <div class="card-body">
              <h2 class="card-title">Feedback</h2>
              <div class="form-control">
                <textarea 
                  v-model="feedbackText" 
                  class="textarea textarea-bordered h-24" 
                  placeholder="Enter feedback for the applicant..."
                ></textarea>
                <div class="mt-4">
                  <button 
                    @click="saveFeedback" 
                    class="btn btn-primary w-full"
                    :disabled="!feedbackText || savingFeedback"
                  >
                    <i v-if="savingFeedback" class="fas fa-spinner fa-spin mr-2"></i>
                    Save Feedback
                  </button>
                </div>
              </div>
              <div v-if="application?.feedback" class="mt-4">
                <h3 class="font-semibold mb-2">Previous Feedback:</h3>
                <div class="text-sm opacity-80 whitespace-pre-wrap">{{ application.feedback }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database'

type ApplicationStatus = Database['public']['Enums']['app_application_status']

interface ApplicationWithDetails {
  id: string
  status: ApplicationStatus
  created_at: string | null
  updated_at: string | null
  completed_at: string | null
  form_data: Record<string, unknown>
  feedback: string | null
  job?: {
    id: string
    title: string
    form?: {
      id: string
      schema: Array<{
        id: string
        name: string
        label: string
        type: string
        required: boolean
        config?: Record<string, unknown>
      }>
    } | null
  } | null
  user?: {
    id: string
    email: string
    first_name: string | null
    last_name: string | null
  } | null
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const route = useRoute()
const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const application = ref<ApplicationWithDetails | null>(null)
const feedbackText = ref('')
const savingFeedback = ref(false)

// Check if user has permission to view and manage applications
const canViewApplications = computed(() => 
  authStore.hasPermissions(['applications.read_all'])
)

const canChangeStatus = computed(() => 
  authStore.hasPermissions(['applications.change_status'])
)

// Available application statuses
const availableStatuses: ApplicationStatus[] = [
  'pending',
  'screening',
  'interview',
  'technical_assessment',
  'offer',
  'accepted',
  'rejected',
  'withdrawn'
]

const isFinalState = (status: ApplicationStatus) => 
  ['accepted', 'rejected', 'withdrawn'].includes(status)

const fetchApplication = async () => {
  if (!canViewApplications.value) {
    error.value = 'You do not have permission to view applications'
    return
  }

  try {
    loading.value = true
    const { data, error: fetchError } = await client
      .from('applications')
      .select(`
        id,
        status,
        created_at,
        updated_at,
        completed_at,
        form_data,
        feedback,
        job:jobs!inner (
          id,
          title,
          form:forms!inner (
            id,
            schema
          )
        ),
        user:user_profiles (
          id,
          email,
          first_name,
          last_name
        )
      `)
      .eq('id', route.params.id)
      .single()

    if (fetchError) throw fetchError
    application.value = data as ApplicationWithDetails
  } catch (err) {
    console.error('Error fetching application:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load application details'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (app: ApplicationWithDetails, newStatus: ApplicationStatus) => {
  if (!canChangeStatus.value) {
    error.value = 'You do not have permission to change application status'
    return
  }

  // Don't update if status hasn't changed
  if (app.status === newStatus) return

  try {
    loading.value = true
    error.value = null

    const { data, error: updateError } = await client
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', app.id)
      .select(`
        id,
        status,
        created_at,
        updated_at,
        completed_at,
        form_data,
        feedback
      `)
      .single()

    if (updateError) throw updateError

    // Update the local application status
    if (data && data.status) {
      app.status = data.status as ApplicationStatus
      app.updated_at = data.updated_at
    }
  } catch (err: any) {
    console.error('Error updating application status:', err)
    error.value = `Failed to update status: ${err.message}`
  } finally {
    loading.value = false
  }
}

const getUserInitials = (user: ApplicationWithDetails['user']) => {
  if (!user) return '?'
  if (user.first_name && user.last_name) {
    return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase()
  }
  return user.email[0].toUpperCase()
}

const getUserFullName = (user: ApplicationWithDetails['user']) => {
  if (!user) return 'Unknown User'
  if (user.first_name && user.last_name) {
    return `${user.first_name} ${user.last_name}`
  }
  return user.email
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatKey = (key: string) => {
  return key.replace(/_/g, ' ')
}

const formatValue = (value: unknown) => {
  if (value === null || value === undefined) return 'N/A'
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (typeof value === 'object') return JSON.stringify(value, null, 2)
  return String(value)
}

const saveFeedback = async () => {
  if (!feedbackText.value) return

  try {
    savingFeedback.value = true
    error.value = null

    const { error: updateError } = await client
      .from('applications')
      .update({
        feedback: feedbackText.value
      })
      .eq('id', route.params.id)
      .select('id, feedback')
      .single()

    if (updateError) throw updateError

    // Update local state
    if (application.value) {
      application.value.feedback = feedbackText.value
    }
    feedbackText.value = '' // Clear the input
    useToast().add({
      title: 'Success',
      description: 'Feedback saved successfully',
      type: 'success'
    })
  } catch (err) {
    console.error('Error saving feedback:', err)
    error.value = err instanceof Error ? err.message : 'Failed to save feedback'
    useToast().add({
      title: 'Error',
      description: 'Failed to save feedback',
      type: 'error'
    })
  } finally {
    savingFeedback.value = false
  }
}

// Fetch application data on mount
onMounted(fetchApplication)
</script> 