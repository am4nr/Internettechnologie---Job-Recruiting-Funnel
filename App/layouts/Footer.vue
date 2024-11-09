<!-- components/Footer.vue -->
<template>
  <footer class="bg-gray-100 mt-12">
    <div class="container mx-auto px-4 py-8">
      <div class="flex flex-col md:flex-row justify-between">
        <!-- Company Info -->
        <div class="mb-6 md:mb-0">
          <h3 class="font-bold text-lg mb-4">Job Portal</h3>
          <p class="text-gray-600 max-w-sm">
            Find your next career opportunity with us.
          </p>
        </div>
        <!-- Footer Links -->
        <div class="grid grid-cols-2 md:grid-cols-3 gap-8">
          <slot />
        </div>
      </div>
      <!-- Copyright -->
      <div class="border-t mt-8 pt-6 text-center text-gray-600">
        <p>&copy; {{ new Date().getFullYear() }} Job Portal. All rights reserved.</p>
      </div>
    </div>
  </footer>
</template>