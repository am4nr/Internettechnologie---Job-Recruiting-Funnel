<!-- components/layout/Footer.vue -->
<template>
  <footer class="footer bg-base-300 text-base-content p-10">
    <div class="flex flex-row justify-between items-start gap-8 w-full">
      <aside class="flex-none">
        <p>
          Kistenkönige
          <br />
          Ihr zuverlässiger Partner für Transport Dienstleistungen
        </p>
      </aside>
      <div class="flex flex-col flex-1">
        <p class="text-center mb-4">Kontaktieren Sie uns und überzeugen Sie sich selbst von unserer Qualität!</p>
      </div>
      <div class="flex flex-col flex-1">
        <address class="flex justify-around gap-4 px-5 max-w-4xl mx-auto">
          <div class="flex-none">
            <strong>Kistenkönige Logistik</strong><br>
            Küstenstraße 42<br>
            17489 Seeburg, Deutschland<br>
          </div>
          <div class="flex-none">
            Telefon: +49 421 12345678<br>
            Telefax: +49 421 87654321<br>
            E-Mail: <a href="mailto:info@kistenkoenige.de"
              class="text-blue-600 hover:text-blue-800">info@kistenkoenige.de</a>
          </div>
        </address>
      </div>
    </div>

    <nav v-for="item in footerItems" :key="item.path">
      <h6 class="footer-title">{{ item.name }}</h6>
      <template v-if="item.children">
        <NuxtLink v-for="child in item.children" :key="child.path" :to="child.path" class="link link-hover">
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