<!-- pages/admin/index.vue -->
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { Database } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

// Initialize Supabase client
const supabase = useSupabaseClient<Database>()

// Stats
const loading = ref(false)
const stats = ref({
  users: 0,
  jobs: 0,
  activeJobs: 0,
  applications: 0
})

// Activity state
const loadingActivity = ref(false)
const activityError = ref<string | null>(null)
const recentActivity = ref<any[]>([])

interface Job {
  id: string
  title: string
  created_at: string
  created_by: string
}

interface Application {
  id: string
  position: string
  created_at: string
  user_id: string
}

// Fetch recent activity
const fetchRecentActivity = async () => {
  loadingActivity.value = true
  try {
    // Fetch recent job postings
    const { data: jobs, error: jobsError } = await supabase
      .from('jobs')
      .select(`
        id,
        title,
        created_at,
        created_by
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (jobsError) throw jobsError

    // Get user profiles for jobs
    const jobUserIds = jobs?.map(job => job.created_by).filter(Boolean) || []
    const { data: jobUsers } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', jobUserIds)

    const jobUsersMap = new Map(jobUsers?.map(user => [user.id, user]) || [])

    // Fetch recent applications
    const { data: applications, error: appsError } = await supabase
      .from('applications')
      .select(`
        id,
        position,
        created_at,
        user_id
      `)
      .order('created_at', { ascending: false })
      .limit(5)

    if (appsError) throw appsError

    // Get user profiles for applications
    const appUserIds = applications?.map(app => app.user_id).filter(Boolean) || []
    const { data: appUsers } = await supabase
      .from('user_profiles')
      .select('id, email')
      .in('id', appUserIds)

    const appUsersMap = new Map(appUsers?.map(user => [user.id, user]) || [])

    // Combine and format activity
    const activity = [
      ...(jobs?.map(job => ({
        id: `job-${job.id}`,
        type: 'Job',
        description: `New job posted: ${job.title}`,
        user: job.created_by ? { email: jobUsersMap.get(job.created_by)?.email } : null,
        created_at: job.created_at
      })) || []),
      ...(applications?.map(app => ({
        id: `app-${app.id}`,
        type: 'Application',
        description: `New application received for ${app.position}`,
        user: app.user_id ? { email: appUsersMap.get(app.user_id)?.email } : null,
        created_at: app.created_at
      })) || [])
    ]

    // Sort by date
    activity.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    // Take most recent 10
    recentActivity.value = activity.slice(0, 10)
  } catch (err: any) {
    console.error('Error fetching activity:', err)
    activityError.value = err.message
  } finally {
    loadingActivity.value = false
  }
}

// Format date helper
const formatDate = (date: string) => {
  const now = new Date()
  const activityDate = new Date(date)
  const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60))

  if (diffInHours < 24) {
    return `${diffInHours} hours ago`
  } else {
    return activityDate.toLocaleDateString()
  }
}

// Fetch data on mount
onMounted(() => {
  fetchRecentActivity()
})
</script>

<template>
  <div class="h-full flex flex-col">
    <!-- Header -->
    <div class="border-b bg-base-100">
      <div class="px-6 py-4">
        <h1 class="text-2xl font-bold">Dashboard Overview</h1>
      </div>
    </div>

    <!-- Content -->
    <div class="flex-1 overflow-auto">
      <!-- Stats Overview -->
      <div class="grid grid-cols-4 gap-4 p-6">
        <div class="flex items-center gap-3">
          <div class="text-4xl font-bold text-primary">3</div>
          <div>
            <div class="text-sm opacity-50">Total Users</div>
            <div class="flex items-center gap-2">
              <i class="fas fa-users text-primary"></i>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-4xl font-bold text-success">0</div>
          <div>
            <div class="text-sm opacity-50">Total Jobs</div>
            <div class="flex items-center gap-2">
              <i class="fas fa-briefcase text-success"></i>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-4xl font-bold text-warning">0</div>
          <div>
            <div class="text-sm opacity-50">Active Jobs</div>
            <div class="flex items-center gap-2">
              <i class="fas fa-check-circle text-warning"></i>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-3">
          <div class="text-4xl font-bold text-secondary">1</div>
          <div>
            <div class="text-sm opacity-50">Applications</div>
            <div class="flex items-center gap-2">
              <i class="fas fa-file-alt text-secondary"></i>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-3 gap-6 p-6">
        <!-- User Management -->
        <div class="bg-primary/10 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-users text-2xl text-primary"></i>
            <h2 class="text-xl font-bold">User Management</h2>
          </div>
          <p class="text-sm opacity-70 mb-4">Manage users, roles, and permissions</p>
          <NuxtLink to="/admin/users" class="btn btn-primary">
            Manage Users
          </NuxtLink>
        </div>

        <!-- Jobs -->
        <div class="bg-success/10 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-briefcase text-2xl text-success"></i>
            <h2 class="text-xl font-bold">Jobs</h2>
          </div>
          <p class="text-sm opacity-70 mb-4">Create and manage job listings</p>
          <NuxtLink to="/admin/jobs" class="btn btn-success">
            Manage Jobs
          </NuxtLink>
        </div>

        <!-- Forms -->
        <div class="bg-secondary/10 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-file-lines text-2xl text-secondary"></i>
            <h2 class="text-xl font-bold">Forms</h2>
          </div>
          <p class="text-sm opacity-70 mb-4">Customize application forms</p>
          <NuxtLink to="/admin/forms" class="btn btn-secondary">
            Manage Forms
          </NuxtLink>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="p-6">
        <h2 class="text-xl font-bold mb-4">Recent Activity</h2>
        <div class="overflow-x-auto">
          <div v-if="loadingActivity" class="flex justify-center items-center py-8">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
          <div v-else-if="activityError" class="alert alert-error">
            {{ activityError }}
          </div>
          <div v-else-if="recentActivity.length === 0" class="text-center py-8 text-gray-500">
            No recent activity
          </div>
          <table v-else class="table w-full">
            <thead>
              <tr>
                <th>Type</th>
                <th>Description</th>
                <th>User</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="activity in recentActivity" :key="activity.id">
                <td>{{ activity.type }}</td>
                <td>{{ activity.description }}</td>
                <td>{{ activity.user?.email }}</td>
                <td>{{ formatDate(activity.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>