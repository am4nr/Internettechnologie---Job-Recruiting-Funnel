<template>
    <div>
        <header class="shadow-sm bg-white">
            <nav class="container mx-auto p-4 flex justify-between">
                <NuxtLink to="/" class="font-bold">MyApp</NuxtLink>
                <ul class="flex gap-4">
                    <li>
                        <NuxtLink to="/">Homepage</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink class="btn" to="/produkte">Produkte</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/impressum">Impressum</NuxtLink>
                    </li>
                    <li v-if="user">
                        <p>Aktuelle User Rolle {{ profile.role }}</p>
                        <button class="btn" @click="logOut">Logout</button>
                    </li>
                    <li v-if="!user">
                        <NuxtLink class="btn" to="/login">Login</NuxtLink>
                    </li>
                </ul>
            </nav>
        </header>

        <!-- Page Content -->
        <div class="container mx-auto p-4">
            <slot />
        </div>
    </div>
</template>

<style scoped>
.router-link-exact-active {
    color: brown;
}
</style>

<script setup>
const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()
const {data: profile} = await supabase.from("profiles").select("*").single()
async function logOut() {
try {
const { error } = await supabase.auth.signOut()
if (error) throw error
 router.push("/login")
} catch (error) {
 console.log(error.message)
}
}
</script>