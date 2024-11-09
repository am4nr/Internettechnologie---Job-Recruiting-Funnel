<!-- components/Header.vue -->
<template>
  <header class="shadow-sm bg-white">
    <NavigationMenu>
      <slot name="nav-links" />
    </NavigationMenu>
  </header>
</template>