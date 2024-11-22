<!-- components/layout/Footer.vue -->
<template>
    <footer class="bg-gray-100">
      <div class="container mx-auto px-4 py-6">
        <div class="flex flex-col md:flex-row justify-between">
          <!-- Footer Links -->
          <div class="mb-4 md:mb-0">
            <h2 class="font-semibold mb-2">Company</h2>
            <ul class="space-y-1">
              <li>
                <NuxtLink to="/about" class="text-gray-600 hover:text-blue-600">About Us</NuxtLink>
              </li>
              <li>
                <NuxtLink to="/contact" class="text-gray-600 hover:text-blue-600">Contact</NuxtLink>
              </li>
            </ul>
          </div>
          <!-- Copyright -->
          <div class="text-gray-600 mt-4 md:mt-0">
            &copy; {{ new Date().getFullYear() }} Job Portal. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  </template>
  
  <script setup lang="ts"></script>