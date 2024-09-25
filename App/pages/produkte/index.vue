<template>
    <div>
        <h1>Produkte</h1>
        <div class="grid grid-cols-4 gap-5">
            <div v-for="p in products">
                <ProductCard :product="p"/>
            </div>
        </div>
    </div>
</template>

<script setup>
definePageMeta({
    layout: 'produkte'
})
// fetch products
const { data: products } = await useFetch('https://fakestoreapi.com/products')

useHead({
      title: 'Mein Shop | Produkte',
      meta: [
        { name: 'description', content: 'Hier gibt es die Produkte' }
      ]
})

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