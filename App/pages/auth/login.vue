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

async function handleSubmit() {
  try {
    if (activeTab.value === 'login') {
      await store.login(email.value, password.value)
      // Router push handled in store
    } else {
      await store.register(email.value, password.value)
      successMsg.value = "Bestätige Deinen Account in der E-Mail"
    }
    errorMsg.value = ""
  } catch (error) {
    errorMsg.value = store.authState.error || error.message
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
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-300 hover:text-blue-500'
          ]">
          Login
        </button>
        <button 
          @click="activeTab = 'register'"
          class="px-6 py-2 -mb-px"
          :class="[
            activeTab === 'register' 
              ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
              : 'text-gray-300 hover:text-blue-500'
          ]">
          Register
        </button>
      </div>

      <h3 v-if="errorMsg" class="text-red-500">{{ errorMsg }}</h3>
      <h3 v-if="successMsg" class="text-green-500">{{ successMsg }}</h3>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="text-sm font-semibold">Email</label>
          <input type="email" id="email" v-model="email"
            class="w-full p-2 mt-1 border rounded-md focus:border-primary focus:outline-none focus:ring focus:ring-primary" />
        </div>
        <div>
          <label for="password" class="text-sm font-semibold">Password</label>
          <input type="password" id="password" v-model="password"
            class="w-full p-2 mt-1 border rounded-md focus:border-primary focus:outline-none focus:ring focus:ring-primary" />
        </div>
        <button type="submit"
          class="w-full py-2 bg-primary text-primary-content rounded-md hover:bg-secondary hover:text-primary-content focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          {{ activeTab === 'login' ? 'Login' : 'Register' }}
        </button>
      </form>
    </div>
  </div>
</template>