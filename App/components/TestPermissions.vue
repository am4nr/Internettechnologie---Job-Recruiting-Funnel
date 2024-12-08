<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Permission Testing</h2>
    
    <div class="space-y-4">
      <!-- Warning Message -->
      <div v-if="showWarning" class="alert alert-warning mb-4">
        <i class="fas fa-exclamation-triangle"></i>
        <div>
          <h3 class="font-bold">Test Environment Warning</h3>
          <p>You are using test accounts. You will be automatically logged out when leaving this page.</p>
          <button 
            class="btn btn-sm btn-ghost mt-2"
            @click="showWarning = false"
          >
            Dismiss
          </button>
        </div>
      </div>

      <!-- Current Role -->
      <div class="card bg-base-200 p-4">
        <h3 class="font-semibold mb-2">Current User & Role</h3>
        <div class="flex items-center gap-2 mb-4">
          <div class="badge badge-lg" :class="{
            'badge-primary': store.auth.value.role === 'admin',
            'badge-secondary': store.auth.value.role === 'recruiter',
            'badge-accent': store.auth.value.role === 'applicant'
          }">
            {{ store.auth.value.role || 'No Role' }}
          </div>
          <span class="text-sm">
            ({{ store.auth.value.user?.email || 'Not logged in' }})
          </span>
          <div v-if="isLoggingIn" class="loading loading-spinner loading-sm"></div>
        </div>

        <!-- Test Account Switcher -->
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="account in testAccounts" 
            :key="account.email"
            @click="loginAs(account.email, account.password)"
            class="btn btn-sm"
            :class="{
              'btn-primary': store.auth.value.role === account.role,
              'btn-outline': store.auth.value.role !== account.role,
              'loading': isLoggingIn
            }"
            :disabled="isLoggingIn"
          >
            Login as {{ account.role }}
          </button>
        </div>
      </div>

      <!-- Test Permissions -->
      <div class="card bg-base-200 p-4">
        <div class="flex flex-wrap gap-2">
          <button 
            v-for="permission in commonPermissions"
            :key="permission"
            @click="testPermission(permission)"
            class="btn btn-sm btn-primary"
          >
            Test {{ permission }}
          </button>
        </div>
      </div>

      <!-- Test Results -->
      <div v-if="results.length" class="card bg-base-200 p-4">
        <div class="flex justify-between items-center mb-4">
          <h3 class="font-semibold">Test Results</h3>
          <button 
            @click="copyReport"
            class="btn btn-sm gap-2"
            :class="copySuccess ? 'btn-success' : 'btn-primary'"
          >
            <i class="fas" :class="copySuccess ? 'fa-check' : 'fa-clipboard'"></i>
            {{ copySuccess ? 'Copied!' : 'Copy Report' }}
          </button>
        </div>

        <div class="space-y-2">
          <div 
            v-for="(result, index) in results" 
            :key="index"
            class="p-2 rounded"
            :class="isPermissionCorrect(result.permission, result.hasPermission, result.role) ? 'bg-green-100' : 'bg-red-100'"
          >
            <div class="flex items-center gap-2">
              <p class="font-medium">{{ result.permission }}</p>
              <span 
                v-if="isPermissionCorrect(result.permission, result.hasPermission, result.role)" 
                class="text-green-600"
                title="Permission behaves as expected"
              >✓</span>
              <span 
                v-else 
                class="text-red-600"
                title="Permission does not behave as expected"
              >✗</span>
              <span class="text-sm text-gray-500">
                (tested as {{ result.role || 'unknown' }})
              </span>
            </div>
            <div class="text-sm text-gray-600">
              <p>Result: {{ result.hasPermission ? 'Granted' : 'Denied' }}</p>
              <p>Response Time: {{ result.time }}ms</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useSupabaseStore } from '~/composables/useSupabaseStore'
import { useAuth } from '~/composables/useAuth'
import type { AppPermission, AppRole } from '~/types/auth'

const store = useSupabaseStore()
const { clearPermissionCache } = useAuth()
const results = ref<Array<{
  permission: AppPermission
  hasPermission: boolean
  time: number
  role: AppRole | null
  email: string | null
}>>([])

const isLoggingIn = ref(false)
const showWarning = ref(true)
const copySuccess = ref(false)

// Test accounts for quick switching
const testAccounts = [
  { email: 'admin@example.com', password: 'Test123', role: 'admin' },
  { email: 'recruiter@example.com', password: 'Test123', role: 'recruiter' },
  { email: 'applicant@example.com', password: 'Test123', role: 'applicant' }
]

// Cleanup function to ensure proper logout on component unmount
onUnmounted(async () => {
  if (store.auth.value.isAuthenticated) {
    // Logout with redirect when leaving the test page
    await store.logout(true)
  }
})

const loginAs = async (email: string, password: string) => {
  try {
    isLoggingIn.value = true
    // First sign out if already signed in
    if (store.auth.value.isAuthenticated) {
      await store.logout(false)
      // Small delay to ensure logout is complete
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    // Clear any cached permissions
    clearPermissionCache()
    // Sign in with new account without redirecting
    await store.login(email, password, false)
    // Don't clear results anymore
    // results.value = []
  } catch (error) {
    console.error('Login failed:', error)
  } finally {
    isLoggingIn.value = false
  }
}

// Define expected permissions for each role
const expectedPermissions: Record<AppRole, AppPermission[]> = {
  admin: [
    'jobs.create',
    'jobs.read_all',
    'applications.read_own',
    'applications.read_all',
    'profiles.read_own',
    'profiles.read_all'
  ],
  recruiter: [
    'jobs.create',
    'jobs.read_all',
    'applications.read_all',
    'profiles.read_all'
  ],
  applicant: [
    'applications.read_own',
    'profiles.read_own'
  ]
}

const commonPermissions: AppPermission[] = [
  'jobs.create',
  'jobs.read_all',
  'applications.read_own',
  'applications.read_all',
  'profiles.read_own',
  'profiles.read_all'
]

const testPermission = async (permission: AppPermission) => {
  const start = performance.now()
  const hasPermission = await store.hasPermission(permission)
  const time = Math.round(performance.now() - start)
  
  // Add role information to the result
  results.value.unshift({
    permission,
    hasPermission,
    time,
    role: store.auth.value.role,
    email: store.auth.value.user?.email || null
  })
}

// Helper to check if permission result matches expectation
const isPermissionCorrect = (permission: AppPermission, hasPermission: boolean, testRole: AppRole | null) => {
  if (!testRole) return false
  const isExpected = expectedPermissions[testRole].includes(permission)
  return hasPermission === isExpected
}

// Generate test report
const generateReport = () => {
  // Group results by role
  const roleGroups = results.value.reduce((groups, result) => {
    const role = result.role || 'unknown'
    if (!groups[role]) {
      groups[role] = []
    }
    groups[role].push({
      permission: result.permission,
      hasPermission: result.hasPermission,
      isCorrect: isPermissionCorrect(result.permission, result.hasPermission, result.role),
      responseTime: result.time,
      testedAs: result.email
    })
    return groups
  }, {} as Record<string, any[]>)

  return JSON.stringify({
    testSummary: {
      totalTests: results.value.length,
      rolesTested: Object.keys(roleGroups).filter(role => role !== 'unknown'),
      timestamp: new Date().toISOString()
    },
    resultsByRole: roleGroups
  }, null, 2)
}

const copyReport = async () => {
  try {
    const report = generateReport()
    await navigator.clipboard.writeText(report)
    copySuccess.value = true
    setTimeout(() => {
      copySuccess.value = false
    }, 2000)
  } catch (error) {
    console.error('Failed to copy report:', error)
  }
}
</script> 