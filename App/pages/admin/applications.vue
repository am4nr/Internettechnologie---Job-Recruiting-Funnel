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
                  <div class="text-sm">{{ application.position }}</div>
                  <div class="text-xs opacity-50">{{ application.job?.title }}</div>
                </td>
                <td>
                  <div class="dropdown dropdown-bottom">
                    <div 
                      tabindex="0" 
                      role="button" 
                      :class="{
                        'badge gap-1 cursor-pointer': true,
                        'badge-warning': application.status === 'pending',
                        'badge-info': application.status === 'reviewing',
                        'badge-success': application.status === 'accepted',
                        'badge-error': application.status === 'rejected'
                      }"
                    >
                      {{ application.status }}
                      <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                    <ul tabindex="0" class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-52">
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
                        'progress-info': application.status === 'reviewing',
                        'progress-success': application.status === 'accepted',
                        'progress-error': application.status === 'rejected'
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
                    <button class="btn btn-ghost btn-xs" @click="viewApplication(application)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button 
                      class="btn btn-ghost btn-xs" 
                      @click="downloadResume(application)" 
                      :disabled="!application.resume_url"
                    >
                      <i class="fas fa-download"></i>
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
import { useSupabaseStore } from '~/composables/useSupabaseStore'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'

type ApplicationWithDetails = Database['public']['Tables']['applications']['Row'] & {
  user?: Database['public']['Tables']['user_profiles']['Row']
  job?: Database['public']['Tables']['jobs']['Row']
}

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

const store = useSupabaseStore()
const supabase = useSupabaseClient<Database>()
const loading = ref(false)
const error = ref<string | null>(null)
const applications = ref<ApplicationWithDetails[]>([])

// Available application statuses
const availableStatuses = ['pending', 'reviewing', 'accepted', 'rejected'] as const

// Load applications on page mount
onMounted(async () => {
  loading.value = true
  try {
    // First get applications with jobs
    const { data: applicationsData, error: fetchError } = await supabase
      .from('applications')
      .select(`
        *,
        job:jobs (
          id,
          title
        )
      `)
      .order('created_at', { ascending: false })

    if (fetchError) throw fetchError

    // Then get user profiles for these applications
    if (applicationsData) {
      const userIds = applicationsData.map(app => app.user_id)
      const { data: usersData, error: usersError } = await supabase
        .from('user_profiles')
        .select('*')
        .in('id', userIds)

      if (usersError) throw usersError

      // Combine the data
      applications.value = applicationsData.map(app => ({
        ...app,
        user: usersData?.find(u => u.id === app.user_id)
      }))
    }
  } catch (err: any) {
    error.value = err.message
    console.error('Error loading applications:', err)
  } finally {
    loading.value = false
  }
})

// Update application status
const updateStatus = async (application: ApplicationWithDetails, newStatus: typeof availableStatuses[number]) => {
  try {
    const { error: updateError } = await supabase
      .from('applications')
      .update({ status: newStatus })
      .eq('id', application.id)

    if (updateError) throw updateError
    application.status = newStatus
  } catch (err: any) {
    error.value = err.message
    console.error('Error updating status:', err)
  }
}

// Get user initials
const getUserInitials = (user?: Database['public']['Tables']['user_profiles']['Row']) => {
  if (!user) return '?'
  if (!user.first_name && !user.last_name) {
    return user.email.charAt(0).toUpperCase()
  }
  return `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase()
}

// Calculate application progress
const getProgress = (application: ApplicationWithDetails) => {
  switch (application.status) {
    case 'pending':
      return 25
    case 'reviewing':
      return 50
    case 'accepted':
      return 100
    case 'rejected':
      return 100
    default:
      return 0
  }
}

// Format date
const formatDate = (date: string | null) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString()
}

// View application details
const viewApplication = (application: ApplicationWithDetails) => {
  // TODO: Implement view details page
  console.log('View application:', application.id)
}

// Download resume
const downloadResume = async (application: ApplicationWithDetails) => {
  if (!application.resume_url) return
  
  try {
    const { data, error: downloadError } = await supabase
      .storage
      .from('resumes')
      .download(application.resume_url)

    if (downloadError) throw downloadError

    // Create download link
    const url = window.URL.createObjectURL(data)
    const link = document.createElement('a')
    link.href = url
    link.download = `resume_${application.user?.last_name || 'download'}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
  } catch (err: any) {
    error.value = err.message
    console.error('Error downloading resume:', err)
  }
}
</script> 