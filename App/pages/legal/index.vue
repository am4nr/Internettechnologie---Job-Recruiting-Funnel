<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Rechtliches</h1>

    <div class="grid md:grid-cols-2 gap-8">
      <!-- Privacy Policy Card -->
      <NuxtLink to="/legal/privacy" class="card bg-base-100 hover:shadow-lg transition-shadow">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-shield-alt text-primary"></i>
            Datenschutzerklärung
          </h2>
          <p class="text-base-content/80">
            Informationen über die Erhebung, Verarbeitung und Nutzung Ihrer personenbezogenen Daten.
          </p>
          <div class="card-actions justify-end">
            <span class="btn btn-primary btn-sm">
              Mehr erfahren
              <i class="fas fa-arrow-right ml-2"></i>
            </span>
          </div>
        </div>
      </NuxtLink>

      <!-- Terms and Conditions Card -->
      <NuxtLink to="/legal/terms" class="card bg-base-100 hover:shadow-lg transition-shadow">
        <div class="card-body">
          <h2 class="card-title">
            <i class="fas fa-file-contract text-primary"></i>
            AGB
          </h2>
          <p class="text-base-content/80">
            Unsere Allgemeinen Geschäftsbedingungen für die Nutzung unserer Dienstleistungen.
          </p>
          <div class="card-actions justify-end">
            <span class="btn btn-primary btn-sm">
              Mehr erfahren
              <i class="fas fa-arrow-right ml-2"></i>
            </span>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Additional Legal Information -->
    <div class="mt-12 prose">
      <h2>Kontakt für rechtliche Angelegenheiten</h2>
      <p>
        Bei Fragen zu rechtlichen Themen können Sie uns unter folgender Adresse erreichen:
      </p>
      <address class="not-italic">
        Kistenkönige Logistik<br>
        Rechtsabteilung<br>
        Küstenstraße 42<br>
        17489 Seeburg<br>
        Deutschland
      </address>
      <p class="mt-4">
        E-Mail: legal@kistenkoenige.de<br>
        Tel: +49 421 12345678
      </p>
    </div>
  </div>
</template>

<script setup>
</script> 