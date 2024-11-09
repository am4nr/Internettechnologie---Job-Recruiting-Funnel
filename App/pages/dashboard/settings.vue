<script setup>
definePageMeta({
  middleware: ['auth']
})

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const applications = ref([])

if (user.value) {
  const { data, error } = await supabase
    .from("bewerbungen")
    .select("*")
  if (error) {
    console.error('Error fetching applications:', error.message)
  } else {
    applications.value = data
  }
}
</script>

<template>
  <div class="container mx-auto px-4 py-8">
    <h1 class="text-2xl font-bold mb-6">Dashboard</h1>
    <p v-if="user">Welcome, {{ user.email }}</p>
    
    <div class="mt-8">
      <h2 class="text-xl font-semibold mb-4">Your Applications</h2>
      <div class="space-y-4">
        <div v-for="application in applications" :key="application.id"
          class="p-4 bg-white rounded-lg shadow">
          <p>{{ application }}</p>
        </div>
      </div>
    </div>
  </div>
</template>