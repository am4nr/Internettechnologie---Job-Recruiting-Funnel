<template>
    <div>
        <header class="shadow-sm bg-white">
            <nav class="container mx-auto p-4">
                <ul class="flex gap-4">
                    <li>
                        <NuxtLink to="/produkte">Produkte</NuxtLink>
                    </li>
                </ul>
            </nav>
        </header>

        <!-- Page Content -->
        <div class="container mx-auto p-4">
            <slot />
        </div>
        <footer>
            <nav class="container mx-auto p-4 flex justify-between border-t-2">
                <ul class="flex gap-4">
                    <li>
                        <NuxtLink to="/">Homepage</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/produkte">Produkte</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/impressum">Impressum</NuxtLink>
                    </li>
                </ul>
            </nav>
        </footer>
    </div>
</template>

<style scoped>
.router-link-exact-active {
    color: brown;
}
</style>