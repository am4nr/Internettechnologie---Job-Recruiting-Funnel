<template>
  <div>
    <h1 class="text-4xl font-bold text-gray-800 mb-6 text-center">
      Aktuelle Stellenangebote für LKW-Fahrer
    </h1>
    <p class="text-lg leading-relaxed text-gray-700 mb-6">
      Hey! Bist du bereit für das ultimative Fahrerlebnis? <br />
      Bei Kistenkönige Logistik suchen wir motivierte LKW-Fahrer, die nicht nur sicher unterwegs sind,
      sondern auch Freude am Fahren haben. Wenn du mehr willst, als nur von A nach B zu kommen, und
      Lust auf ein Abenteuer auf den Straßen Norddeutschlands hast, dann bist du bei uns genau richtig!
    </p>
    <p class="text-lg leading-relaxed text-gray-700 mb-6">
      Worauf wartest du? Steig ein und werde Teil unseres Teams!
    </p>

    <div v-if="loading" class="text-center py-8">
      <p>Laden...</p>
    </div>
    
    <div v-else-if="error" class="text-center py-8 text-red-600">
      <p>{{ error }}</p>
    </div>
    
    <div v-else>
      <h2 class="text-2xl font-semibold text-gray-800 mb-4">Wir suchen:</h2>
      <ul class="list-disc list-inside text-gray-700 text-lg space-y-2">
        <li v-for="job in jobs" :key="job.id">
          <NuxtLink :to="`/jobs/${job.id}`" class="hover:text-primary">
            {{ job.title }}
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Job } from '~/types'
import { useJobs } from '~/composables/useJobs'

const { getJobs } = useJobs()
const jobs = ref<Job[]>([])
const loading = ref(false)
const error = ref<Error | null>(null)

const fetchJobs = async () => {
  loading.value = true
  error.value = null
  try {
    const fetchedJobs = await getJobs()
    jobs.value = fetchedJobs as Job[]
  } catch (e) {
    error.value = e as Error
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchJobs()
})
</script>
  
<style scoped>
</style>
  