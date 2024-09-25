<template>
    <div class="card text-center">
        <img :src="props.product.image" alt="product thumb" class="thumb">
        <p class="font-bold: text-gray-500 m-4 truncate">{{ props.product.title }}</p>
        <NuxtLink :to="`/produkte/${props.product.id}`">
            <p class="btn my-4">View Details</p>
        </NuxtLink>
    </div>
</template>

<script setup>
    const props = defineProps(['product'])
</script>

<style scoped>
    .thumb {
        max-height: 120px;
        max-width: 70%;
        margin: 0 auto;
    }
</style>