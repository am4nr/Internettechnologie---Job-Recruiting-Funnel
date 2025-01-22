<script setup lang="ts">
import type { Database } from '~/types/database'

definePageMeta({
  auth: {
    unauthenticatedOnly: true,
    navigateAuthenticatedTo: '/dashboard'
  }
})

// State
const client = useSupabaseClient<Database>()
const route = useRoute()
const activeTab = ref('login')
const email = ref("")
const password = ref("") 
const errorMsg = ref<string | null>(null)
const successMsg = ref<string | null>(null)
const isLoading = ref(false)

// Methods
const handleLogin = async () => {
  try {
    isLoading.value = true
    errorMsg.value = null

    const { error } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) throw error

    // Navigate to redirect URL or dashboard
    const redirectTo = route.query.redirect as string
    await navigateTo(redirectTo || '/dashboard')
  } catch (err) {
    console.error('Login error:', err)
    errorMsg.value = 'Invalid email or password'
  } finally {
    isLoading.value = false
  }
}

const handleRegister = async () => {
  try {
    const { data: { user: newUser }, error } = await client.auth.signUp({
      email: email.value,
      password: password.value
    })
    if (error) throw error
    
    if (newUser?.id && newUser?.email) {
      // Create user profile
      const { error: profileError } = await client
        .from('user_profiles')
        .insert({
          id: newUser.id,
          email: newUser.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
      if (profileError) throw profileError

      // Check if this is the first user
      const { count } = await client
        .from('user_roles')
        .select('*', { count: 'exact', head: true })

      // Create user role - first user becomes admin
      const { error: roleError } = await client
        .from('user_roles')
        .insert({
          user_id: newUser.id,
          role: count === 0 ? 'admin' : 'applicant'
        })
      if (roleError) throw roleError

      successMsg.value = "Please confirm your account via email"
    }
  } catch (error: any) {
    errorMsg.value = error.message || 'An error occurred during registration'
  }
}

const handleSubmit = async () => {
  try {
    isLoading.value = true
    errorMsg.value = null
    successMsg.value = null
    
    if (activeTab.value === 'login') {
      await handleLogin()
    } else {
      await handleRegister()
    }
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div class="w-full max-w-md p-8 space-y-6 rounded-xl bg-base-300 shadow-md">
      <!-- Tab Navigation -->
      <div class="tabs tabs-boxed">
        <a 
          :class="['tab', { 'tab-active': activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          Login
        </a>
        <a 
          :class="['tab', { 'tab-active': activeTab === 'register' }]"
          @click="activeTab = 'register'"
        >
          Register
        </a>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text">Email</span>
          </label>
          <input 
            v-model="email"
            type="email" 
            placeholder="email@example.com"
            class="input input-bordered w-full" 
            required
          />
        </div>

        <div class="form-control">
          <label class="label">
            <span class="label-text">Password</span>
          </label>
          <input 
            v-model="password"
            type="password"
            class="input input-bordered w-full"
            required
          />
        </div>

        <div v-if="errorMsg" class="alert alert-error">
          {{ errorMsg }}
        </div>

        <div v-if="successMsg" class="alert alert-success">
          {{ successMsg }}
        </div>

        <button 
          type="submit" 
          class="btn btn-primary w-full"
          :class="{ 'loading': isLoading }"
          :disabled="isLoading"
        >
          {{ activeTab === 'login' ? 'Sign In' : 'Sign Up' }}
        </button>
      </form>
    </div>
  </div>
</template>