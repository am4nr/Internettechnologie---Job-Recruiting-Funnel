<template>
    <div>
        <h1>Applying for {{route.params.id}}</h1>
        <p>lorem ipsum</p>
    </div>
</template>

<script setup>
const route = useRoute()
</script>

<style scoped>
h1 {
    margin-bottom: 20px;
    font-size: 36px;
}

p {
    margin: 20px 0;
}
</style>