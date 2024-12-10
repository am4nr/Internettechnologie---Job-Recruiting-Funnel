<!-- components/layout/Header.vue -->
<template>
  <header class="bg-white shadow-sm">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center font-bold text-xl">
          Kistenkönige Logistik
        </NuxtLink>
        <!-- Navigation -->
        <Navigation />
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import Navigation from '~/components/navigation/Navigation.vue'
</script>