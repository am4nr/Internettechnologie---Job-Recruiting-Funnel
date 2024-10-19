<script setup>
    definePageMeta({
        middleware: 'auth'
    })
    const user = ref(useSupabaseUser())
    const supabase = useSupabaseClient()
    const { data: kommentare } = await supabase.from("Bewerbungen").select("*")
</script>

<template>
    <div>
        <h1>Backend</h1>
        <p v-if="user">Hallo {{ user.email }}</p>
        <p>Hier nur Zugang mit Mail und Password</p>
        <div class="">
            <div v-for="k in kommentare">
                <p>{{ k }}</p>
            </div>
        </div>
    </div>
</template>

<style scoped>
h1 {
    margin-bottom: 20px;
    font-size: 36px;
}

p {
    margin: 20px 0;
}
</style>