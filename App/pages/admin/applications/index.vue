<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="border-b bg-base-100">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold">Applications</h1>
      </div>
    </div>
    
    <!-- Content -->
    <div class="flex-1 overflow-auto">
      <div class="min-w-full bg-base-100">
        <div v-if="loading" class="flex justify-center items-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>

        <div v-if="error" class="alert alert-error m-6">
          {{ error }}
        </div>

        <div v-else-if="!canViewApplications" class="alert alert-warning m-6">
          You do not have permission to view applications.
        </div>

        <div v-else-if="applications.length === 0" class="text-center py-8 text-gray-500">
          No applications found.
        </div>

        <div v-else>
          <table class="table w-full">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Position</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="application in applications" :key="application.id">
                <td>
                  <div class="flex items-center gap-3">
                    <div class="avatar placeholder">
                      <div class="bg-neutral text-neutral-content rounded-full w-10">
                        <span class="text-lg">{{ getUserInitials(application.user) }}</span>
                      </div>
                    </div>
                    <div class="text-sm">{{ application.user?.email }}</div>
                  </div>
                </td>
                <td>
                  <div class="text-sm">{{ application.job?.title }}</div>
                </td>
                <td>
                  <div class="dropdown dropdown-bottom">
                    <div 
                      tabindex="0" 
                      role="button" 
                      :class="{
                        'badge gap-1': true,
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
                      <i v-if="canChangeStatus && !isFinalState(application.status)" class="fas fa-chevron-down text-xs"></i>
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
                </td>
                <td>
                  <div class="flex items-center gap-2">
                    <progress 
                      class="progress w-14" 
                      :class="{
                        'progress-warning': application.status === 'pending',
                        'progress-info': application.status === 'screening' || application.status === 'interview',
                        'progress-primary': application.status === 'technical_assessment' || application.status === 'offer',
                        'progress-success': application.status === 'accepted',
                        'progress-error': application.status === 'rejected' || application.status === 'withdrawn'
                      }"
                      :value="getProgress(application)" 
                      max="100"
                    ></progress>
                    <span class="text-xs">{{ getProgress(application) }}%</span>
                  </div>
                </td>
                <td class="text-sm">{{ formatDate(application.created_at) }}</td>
                <td>
                  <div class="flex items-center gap-1">
                    <button 
                      class="btn btn-ghost btn-xs" 
                      @click="viewApplication(application)"
                      aria-label="View application details"
                    >
                      <i class="fas fa-eye"></i>
                      View
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseClient, navigateTo } from '#imports'
import type { Database } from '~/types/database'

type ApplicationStatus = Database['public']['Enums']['app_application_status']

interface ApplicationWithDetails {
  id: string
  status: ApplicationStatus
  created_at: string | null
  updated_at: string | null
  form_data: Record<string, unknown>
  job?: {
    id: string
    title: string
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

const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const loading = ref(false)
const error = ref<string | null>(null)
const applications = ref<ApplicationWithDetails[]>([])

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

const fetchApplications = async () => {
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
        form_data,
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
      .not('status', 'is', null)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError
    applications.value = data ? (data as ApplicationWithDetails[]) : []
  } catch (err) {
    console.error('Error fetching applications:', err)
    error.value = 'Failed to load applications'
  } finally {
    loading.value = false
  }
}

const updateStatus = async (application: ApplicationWithDetails, newStatus: ApplicationStatus) => {
  if (!canChangeStatus.value) {
    error.value = 'You do not have permission to change application status'
    return
  }

  // Don't update if status hasn't changed
  if (application.status === newStatus) return

  try {
    loading.value = true
    error.value = null

    const { data, error: updateError } = await client
      .from('applications')
      .update({
        status: newStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', application.id)
      .select(`
        id,
        status,
        created_at,
        updated_at,
        form_data
      `)
      .single()

    if (updateError) throw updateError

    // Update the local application status
    if (data && data.status) {
      application.status = data.status as ApplicationStatus
      application.updated_at = data.updated_at
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
  const firstName = user.first_name || ''
  const lastName = user.last_name || ''
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase() || user.email?.charAt(0).toUpperCase() || '?'
}

const getProgress = (application: ApplicationWithDetails) => {
  // Simple progress calculation based on status
  const statusOrder = {
    pending: 0,
    screening: 20,
    interview: 40,
    technical_assessment: 60,
    offer: 80,
    accepted: 100,
    rejected: 100,
    withdrawn: 100
  }
  return statusOrder[application.status] || 0
}

const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

const viewApplication = (application: ApplicationWithDetails) => {
  navigateTo(`/admin/applications/${application.id}`)
}

onMounted(() => {
  fetchApplications()
})
</script> 