<!-- components/layout/Footer.vue -->
<template>
  <footer class="bg-base-300 text-base-content">
    <div class="container mx-auto pt-1 pb-2">
      <!-- Main Footer Content -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-x-4 gap-y-2 px-6">
        <!-- Company Info -->
        <div>
          <h3 class="font-bold mb-1">Kistenkönige Logistik</h3>
          <div class="space-y-1">
            <a href="mailto:info@kistenkoenige.de" class="inline-flex items-center gap-2 hover:text-primary transition-colors">
              <i class="fas fa-envelope w-4"></i>
              <span>info@kistenkoenige.de</span>
            </a>
            <div class="flex items-center gap-2">
              <i class="fas fa-phone w-4"></i>
              <div class="leading-tight">
                <a href="tel:+494211234567" class="hover:text-primary transition-colors block">+49 421 12345678</a>
                <a href="tel:+494218765432" class="hover:text-primary transition-colors block">+49 421 87654321</a>
              </div>
            </div>
          </div>
        </div>

        <!-- Address -->
        <div>
          <h3 class="font-bold mb-1">Standort</h3>
          <address class="not-italic flex items-start gap-2 leading-tight">
            <i class="fas fa-location-dot w-4 mt-0.5"></i>
            <div>
              Küstenstraße 42<br>
              17489 Seeburg<br>
              Deutschland
            </div>
          </address>
        </div>

        <!-- Navigation Links -->
        <div v-for="item in footerItems" :key="item.path">
          <h3 class="font-bold mb-1">{{ item.name }}</h3>
          <ul class="space-y-1">
            <li v-for="child in item.children" :key="child.path">
              <NuxtLink 
                :to="child.path" 
                class="hover:text-primary transition-colors"
              >
                {{ child.name }}
              </NuxtLink>
            </li>
          </ul>
        </div>

        <!-- Copyright Notice -->
        <div class="md:col-span-2 lg:col-span-1">
          <h3 class="font-bold mb-1 opacity-0">·</h3>
          <p class="text-sm opacity-80">© {{ new Date().getFullYear() }} Kistenkönige Logistik. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useNav } from '~/composables/useNav'

const { footerItems } = useNav()
</script>