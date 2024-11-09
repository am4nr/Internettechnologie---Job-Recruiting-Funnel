<script setup lang="ts">
  const supabase = useSupabaseClient()
  const email = ref("")
  const password = ref(null) 
  const errorMsg = ref(null)
  const successMsg = ref(null)

  async function signUp() {
    try {
      // Check if email is example.com domain
      const isTestEmail = email.value.endsWith('@example.com')
      
      const { data, error } = await supabase.auth.signUp({
        email: email.value,
        password: password.value,
        options: {
          data: {
            email_confirmed: isTestEmail, // Add metadata for auto-confirmation
            // This helps identify test accounts
          }
        }
      })

      if (error) throw error

      if (isTestEmail) {
        // For example.com, auto-confirm and show success
        await supabase.auth.signInWithPassword({
          email: email.value,
          password: password.value
        })
        successMsg.value = "Account created successfully!"
      } else {
        successMsg.value = "Bestätige Deinen Account in der E-Mail"
      }
      errorMsg.value = ""
    } catch (error) {
      errorMsg.value = error.message
    }
  }
</script>

<template>
    <div class="flex justify-center">
      <div class="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-md">
        <h1 class="text-2xl font-bold text-center">Register</h1>
        <h3 class="text-red-500">{{ errorMsg }}</h3>
        <form class="space-y-6" action="#" method="POST" @submit.prevent="signUp">
          <div>
            <label for="email" class="text-sm font-semibold">Email</label>
            <input type="email" id="email" placeholder="Email" v-model="email"
              class="w-full p-2 mt-1 border rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300" />
          </div>
          <div>
            <label for="password" class="text-sm font-semibold">Password</label>
            <input type="password" id="password" placeholder="Password" v-model="password"
              class="w-full p-2 mt-1 border rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300" />
          </div>
          <button type="submit"
            class="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Sign Up
          </button>
        </form>
        <h3 class="text-green-500">{{ successMsg }}</h3>
      </div>
    </div>
</template>