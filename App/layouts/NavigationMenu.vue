<!-- components/NavigationMenu.vue -->
<template>
  <nav class="bg-white shadow-sm z-50 relative">
    <div class="container mx-auto px-4">
      <div class="flex justify-between items-center h-16">
        <!-- Logo -->
        <NuxtLink to="/" class="flex items-center font-bold">
          Job Portal
        </NuxtLink>
        <!-- Hamburger Menu -->
        <input type="checkbox" id="nav-toggle" class="hidden peer">
        <label for="nav-toggle" class="md:hidden cursor-pointer p-2">
          <div class="w-6 h-5 relative">
            <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300 
                         origin-center top-0 
                         peer-checked:rotate-45 peer-checked:top-1/2 peer-checked:-translate-y-1/2"></span>
            <span class="absolute w-full h-0.5 bg-gray-600 transition-opacity duration-300
                         top-1/2 -translate-y-1/2
                         peer-checked:opacity-0"></span>
            <span class="absolute w-full h-0.5 bg-gray-600 transform transition-all duration-300
                         origin-center bottom-0
                         peer-checked:-rotate-45 peer-checked:bottom-1/2 peer-checked:translate-y-1/2"></span>
          </div>
        </label>
        <!-- Navigation Links -->
        <div class="fixed md:relative top-16 md:top-0 left-0 w-full md:w-auto 
                    bg-white md:bg-transparent transform transition-transform duration-300 
                    translate-x-full peer-checked:translate-x-0 md:translate-x-0
                    h-[calc(100vh-4rem)] md:h-auto overflow-y-auto md:overflow-visible
                    p-4 md:p-0
                    flex flex-col md:flex-row items-start md:items-center">
          <slot />
        </div>
      </div>
    </div>
  </nav>
</template>