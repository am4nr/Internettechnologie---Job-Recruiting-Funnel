<template>
    <main class="px-4 py-8">
      <section v-if="job">
        <h2 class="text-xl font-bold mb-1">{{ job.title }}</h2>
        <p class="mb-1">{{ job.location }}</p>
        <header class="py-2 px-4 border-b-4 border-primary/25"></header>
        
        <div class="mt-6 mb-10">
          <h3 class="font-bold mb-2">Werde Teil unseres Teams!</h3>
          <p>{{ job.description }}</p>
        </div>
        
        <div class="flex flex-col md:flex-row gap-6 mb-6">
          <div class="flex-1">
            <h3 class="font-bold mb-2">
              <i class="fas fa-pen text-xl text-primary/75 mr-2"></i>
              Deine Aufgaben:
            </h3>
            <div class="whitespace-pre-line">{{ job.tasks }}</div>
          </div>
          
          <div class="flex-1">
            <h3 class="font-bold mb-2">
              <i class="fas fa-check text-xl text-primary/75 mr-2"></i>
              Dein Profil:
            </h3>
            <div class="whitespace-pre-line">{{ job.requirements }}</div>
          </div>
        </div>
        
        <div class="mb-4">
            <h3 class="font-bold mb-2">
              <i class="fas fa-gift text-xl text-primary/75 mr-2"></i>
              Das bieten wir dir:
            </h3>
          <div class="whitespace-pre-line">{{ job.benefits }}</div>
        </div>
        
        <div class="mb-4">
          <p>Bewirb dich jetzt ganz einfach mit unserem Online-Bewerbungsformular!</p>
          <div class="mt-4">
            <FormViewer 
              v-if="formSchema.length > 0"
              :schema="formSchema"
              submit-label="Bewerbung absenden"
              v-model="applicationData"
              @submit="onSubmit"
            />
          </div>
        </div>
      </section>
      <div v-else-if="error" class="text-center py-8 text-red-600">
        <p>{{ error }}</p>
      </div>
      <div v-else class="text-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p class="mt-4">Loading...</p>
      </div>
    </main>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '~/stores/auth'
import { useSupabaseClient, useSupabaseUser } from '#imports'
import type { Database, Json } from '~/types/database'
import FormViewer from '@/components/form/FormViewer.vue'
import { useFormTemplates } from '~/composables/useFormTemplates'
import type { FormField } from '~/types/form'
import { useToast } from '~/composables/useToast'

type Job = Database['public']['Tables']['jobs']['Row']

const route = useRoute()
const router = useRouter()
const client = useSupabaseClient<Database>()
const authStore = useAuthStore()
const user = useSupabaseUser()
const job = ref<Job>({
  id: '',
  title: '',
  description: null,
  location: null,
  status: 'draft',
  tasks: null,
  requirements: null,
  benefits: null,
  form_id: null,
  created_at: null,
  updated_at: null,
  created_by: null
})
const error = ref<string | null>(null)
const applicationData = ref<Record<string, unknown>>({})
const isLoading = ref(false)
const { getTemplate } = useFormTemplates()
const formSchema = ref<FormField[]>([])
const toast = useToast()

const fetchJob = async () => {
  try {
    isLoading.value = true
    error.value = null
    const { data: jobData, error: jobError } = await client
      .from('jobs')
      .select(`
        id,
        title,
        location,
        description,
        status,
        tasks,
        requirements,
        benefits,
        form_id,
        created_at,
        updated_at,
        created_by
      `)
      .eq('id', route.params.id)
      .eq('status', 'published')
      .single()

    if (jobError) throw jobError

    job.value = jobData

    // Fetch form schema if available
    if (job.value.form_id) {
      const { data: formData, error: formError } = await client
        .from('forms')
        .select('schema')
        .eq('id', job.value.form_id)
        .single()

      if (formError) throw formError
      if (formData?.schema) {
        // Assert the schema type since we know it follows the FormField structure
        formSchema.value = (formData.schema as unknown) as FormField[]
      }
    }
  } catch (err) {
    console.error('Error fetching job:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load job details'
    router.push('/jobs')
  } finally {
    isLoading.value = false
  }
}

const onSubmit = async (submittedData: Record<string, any>) => {
  if (!user.value || !job.value) return

  try {
    isLoading.value = true
    
    // Insert application directly into the applications table
    const { data, error } = await client
      .from('applications')
      .insert({
        user_id: user.value.id,
        job_id: job.value.id,
        position: job.value.title,
        form_data: submittedData as Json,
        status: 'pending'
      })
      .select()
      .single()

    if (error) throw error

    // Show success message
    toast.add({
      title: 'Success',
      description: 'Your application has been submitted successfully',
      type: 'success'
    })

    // Redirect to dashboard on success
    await router.push('/dashboard')
  } catch (err) {
    console.error('Error submitting application:', err)
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Failed to submit application',
      type: 'error'
    })
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  fetchJob()
})
</script>

<style scoped>
h1 {
    margin-bottom: 20px;
    font-size: 36px;
}

p {
    margin: 20px 0;
}
</style>