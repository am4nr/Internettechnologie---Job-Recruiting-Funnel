<!-- pages/admin/index.vue -->
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useSupabaseClient } from '#imports'
import { useAuthStore } from '~/stores/auth'
import type { Database } from '~/types/database'

definePageMeta({
  layout: 'admin',
  middleware: ['auth']
})

// Initialize stores
const authStore = useAuthStore()

// Compute permissions for different sections
const hasAdminPerms = computed(() => authStore.hasPermissions(['roles.read_all', 'roles.update_all']))
const hasJobManagementPerms = computed(() => authStore.hasPermissions([
  'jobs.create',
  'applications.read_all',
  'applications.change_status',
  'forms.read_all'
]))

interface ActivityItem {
  id: string
  type: 'Job' | 'Application' | 'Status Change'
  description: string
  user_email: string | null
  created_at: string
}

interface ApplicationWithRelations {
  id: string
  status: Database['public']['Enums']['app_application_status']
  created_at: string
  user_profiles: {
    email: string
  }[] | null
  jobs: {
    title: string
  }[] | null
}

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
const recentActivity = ref<ActivityItem[]>([])

// Fetch recent activity
const fetchRecentActivity = async () => {
  loadingActivity.value = true
  activityError.value = null

  try {
    const { data, error } = await supabase
      .rpc('get_admin_activity')

    if (error) throw error

    // Cast the response to the correct type
    recentActivity.value = (data as ActivityItem[]).map(item => ({
      ...item,
      type: item.type as 'Job' | 'Application' | 'Status Change'
    }))
  } catch (err) {
    console.error('Error fetching recent activity:', err)
    activityError.value = 'Failed to load recent activity'
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

// Fetch dashboard stats
const fetchStats = async () => {
  loading.value = true
  try {
    // Get total users
    if (hasAdminPerms.value) {
      const { count: userCount } = await supabase
        .from('user_profiles')
        .select('*', { count: 'exact', head: true })
      stats.value.users = userCount || 0
    }

    // Get total jobs
    const { count: jobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
    stats.value.jobs = jobCount || 0

    // Get active jobs
    const { count: activeJobCount } = await supabase
      .from('jobs')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'published')
    stats.value.activeJobs = activeJobCount || 0

    // Get total applications
    const { count: applicationCount } = await supabase
      .from('applications')
      .select('*', { count: 'exact', head: true })
    stats.value.applications = applicationCount || 0

  } catch (err) {
    console.error('Error fetching dashboard stats:', err)
  } finally {
    loading.value = false
  }
}

// Fetch data on mount
onMounted(() => {
  fetchStats()
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
        <template v-if="loading">
          <div v-for="i in 4" :key="i" class="flex items-center gap-3">
            <div class="loading loading-spinner loading-lg"></div>
          </div>
        </template>
        <template v-else>
          <!-- Show user stats only for admins -->
          <div v-if="hasAdminPerms" class="flex items-center gap-3">
            <div class="text-4xl font-bold text-primary">{{ stats.users }}</div>
            <div>
              <div class="text-sm opacity-50">Total Users</div>
              <div class="flex items-center gap-2">
                <i class="fas fa-users text-primary"></i>
              </div>
            </div>
          </div>

          <!-- Job-related stats for admins and recruiters -->
          <template v-if="hasJobManagementPerms || hasAdminPerms">
            <div class="flex items-center gap-3">
              <div class="text-4xl font-bold text-success">{{ stats.jobs }}</div>
              <div>
                <div class="text-sm opacity-50">Total Jobs</div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-briefcase text-success"></i>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-4xl font-bold text-warning">{{ stats.activeJobs }}</div>
              <div>
                <div class="text-sm opacity-50">Active Jobs</div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-check-circle text-warning"></i>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-3">
              <div class="text-4xl font-bold text-secondary">{{ stats.applications }}</div>
              <div>
                <div class="text-sm opacity-50">Applications</div>
                <div class="flex items-center gap-2">
                  <i class="fas fa-file-alt text-secondary"></i>
                </div>
              </div>
            </div>
          </template>
        </template>
      </div>

      <!-- Quick Actions -->
      <div class="grid grid-cols-3 gap-6 p-6">
        <!-- User Management - Admin only -->
        <div v-if="hasAdminPerms" class="bg-primary/10 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-users text-2xl text-primary"></i>
            <h2 class="text-xl font-bold">User Management</h2>
          </div>
          <p class="text-sm opacity-70 mb-4">Manage users, roles, and permissions</p>
          <NuxtLink to="/admin/users" class="btn btn-primary">
            Manage Users
          </NuxtLink>
        </div>

        <!-- Jobs - Available to both -->
        <div v-if="hasJobManagementPerms || hasAdminPerms" class="bg-success/10 rounded-lg p-6">
          <div class="flex items-center gap-3 mb-4">
            <i class="fas fa-briefcase text-2xl text-success"></i>
            <h2 class="text-xl font-bold">Jobs</h2>
          </div>
          <p class="text-sm opacity-70 mb-4">Create and manage job listings</p>
          <NuxtLink to="/admin/jobs" class="btn btn-success">
            Manage Jobs
          </NuxtLink>
        </div>

        <!-- Forms - Available to both -->
        <div v-if="hasJobManagementPerms || hasAdminPerms" class="bg-secondary/10 rounded-lg p-6">
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
              <tr v-for="item in recentActivity" :key="item.id">
                <td>
                  <div class="badge" :class="{
                    'badge-primary': item.type === 'Job',
                    'badge-success': item.type === 'Application',
                    'badge-warning': item.type === 'Status Change'
                  }">
                    {{ item.type }}
                  </div>
                </td>
                <td>{{ item.description }}</td>
                <td>{{ item.user_email || 'N/A' }}</td>
                <td>{{ formatDate(item.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>