<!-- components/layout/Footer.vue -->
<template>
  <footer class="footer bg-base-300 text-base-content p-10">
    <aside>
      <p>
        Job Portal
        <br />
        Find your next opportunity
      </p>
    </aside>

    <nav v-for="item in footerItems" :key="item.path">
      <h6 class="footer-title">{{ item.name }}</h6>
      <template v-if="item.children">
        <NuxtLink 
          v-for="child in item.children" 
          :key="child.path"
          :to="child.path"
          class="link link-hover"
        >
          {{ child.name }}
        </NuxtLink>
      </template>
    </nav>
  </footer>
</template>

<script setup lang="ts">
import { useNav } from '~/composables/useNav'

const { footerItems } = useNav()
</script>