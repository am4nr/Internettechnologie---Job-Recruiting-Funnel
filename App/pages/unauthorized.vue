<script setup lang="ts">
definePageMeta({
  layout: 'default'
})

const router = useRouter()
</script>

<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-6 p-8">
      <div class="text-6xl text-error mb-4">
        <i class="fas fa-lock"></i>
      </div>
      <h1 class="text-3xl font-bold">Access Denied</h1>
      <p class="text-base-content/70">You don't have permission to access this page.</p>
      <div class="flex justify-center gap-4">
        <button class="btn btn-primary" @click="router.back()">
          <i class="fas fa-arrow-left mr-2"></i>
          Go Back
        </button>
        <NuxtLink to="/" class="btn">
          <i class="fas fa-home mr-2"></i>
          Home
        </NuxtLink>
      </div>
    </div>
  </div>
</template> 