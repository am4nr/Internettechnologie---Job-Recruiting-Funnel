<template>
  <div class="min-h-screen flex flex-col">
    <Navigation class="sticky top-0 z-50" />
    <main class="flex-grow">
      <NuxtPage />
    </main>
    <Footer />
  </div>
</template>

<script setup lang="ts">
import { useNav } from '~/composables/useNav'
import { useSupabaseUser } from '#imports'
import Navigation from '~/components/navigation/Navigation.vue'
import Footer from '~/components/layout/Footer.vue'
const { navItems } = useNav()
const user = useSupabaseUser()
</script>

<style scoped>
/* Any styles specific to the navigation if needed */
</style>