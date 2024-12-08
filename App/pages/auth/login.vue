<script setup>
import { useSupabaseStore } from '~/composables/useSupabaseStore'

definePageMeta({
  middleware: ['auth'],
  requiresAuth: false 
})

const store = useSupabaseStore()
const router = useRouter()

const activeTab = ref('login')
const email = ref("")
const password = ref("") 
const errorMsg = ref(null)
const successMsg = ref(null)

const isLoading = computed(() => store.auth.value.isLoading)
const authError = computed(() => store.auth.value.error)

watch(authError, (newError) => {
  if (newError) {
    errorMsg.value = newError
  }
})

async function handleSubmit() {
  try {
    errorMsg.value = null
    successMsg.value = null
    
    if (activeTab.value === 'login') {
      await store.login(email.value, password.value)
    } else {
      await store.register(email.value, password.value)
      successMsg.value = "Please confirm your account via email"
    }
  } catch (error) {
    errorMsg.value = error.message
  }
}
</script>

<template>
  <div class="flex justify-center">
    <div class="w-full max-w-md p-8 space-y-6 rounded-xl bg-base-300 shadow-md">
      <!-- Tab Navigation -->
      <div class="flex border-b">
        <button 
          @click="activeTab = 'login'"
          class="px-6 py-2 -mb-px"
          :class="[
            activeTab === 'login' 
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-base-content/70 hover:text-primary'
          ]"
          :disabled="isLoading"
        >
          Login
        </button>
        <button 
          @click="activeTab = 'register'"
          class="px-6 py-2 -mb-px"
          :class="[
            activeTab === 'register' 
              ? 'border-b-2 border-primary text-primary font-medium'
              : 'text-base-content/70 hover:text-primary'
          ]"
          :disabled="isLoading"
        >
          Register
        </button>
      </div>

      <h3 v-if="errorMsg" class="text-error">{{ errorMsg }}</h3>
      <h3 v-if="successMsg" class="text-success">{{ successMsg }}</h3>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="text-sm font-semibold">Email</label>
          <input 
            type="email" 
            id="email" 
            v-model="email"
            :disabled="isLoading"
            class="w-full p-2 mt-1 border rounded-md focus:border-primary focus:outline-none focus:ring focus:ring-primary" 
          />
        </div>
        <div>
          <label for="password" class="text-sm font-semibold">Password</label>
          <input 
            type="password" 
            id="password" 
            v-model="password"
            :disabled="isLoading"
            class="w-full p-2 mt-1 border rounded-md focus:border-primary focus:outline-none focus:ring focus:ring-primary" 
          />
        </div>
        <button 
          type="submit"
          class="w-full py-2 bg-primary text-primary-content rounded-md hover:bg-primary-focus focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
          :disabled="isLoading"
        >
          <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
          <span v-else>{{ activeTab === 'login' ? 'Login' : 'Register' }}</span>
        </button>
      </form>
    </div>
  </div>
</template>