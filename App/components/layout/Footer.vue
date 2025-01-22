<!-- components/layout/Footer.vue -->
<template>
  <footer class="bg-base-200 text-base-content">
    <div class="container mx-auto">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 p-6">
        <!-- Company Info -->
        <div>
          <h3 class="font-bold mb-1">Kontakt</h3>
          <div class="flex flex-col gap-2">
            <a href="tel:+49123456789" class="flex items-start gap-2 hover:text-primary">
              <i class="fas fa-phone w-4 mt-0.5"></i>
              <span>+49 123 456 789</span>
            </a>
            <a href="mailto:info@kistenkonige.de" class="flex items-start gap-2 hover:text-primary">
              <i class="fas fa-envelope w-4 mt-0.5"></i>
              <span>info@kistenkonige.de</span>
            </a>
          </div>
        </div>

        <!-- Location -->
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

        <!-- Footer Sections -->
        <template v-for="section in footerSections" :key="section.title">
          <div>
            <h3 class="font-bold mb-1">{{ section.title }}</h3>
            <ul class="space-y-1">
              <li v-for="item in section.items" :key="item.to">
                <NuxtLink 
                  :to="item.to" 
                  class="hover:text-primary transition-colors"
                >
                  {{ item.label }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </template>

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

const { footerSections } = useNav()
</script>