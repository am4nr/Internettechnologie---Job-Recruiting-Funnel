<template>
    <div>
        <Head>
            <Title>Mein Shop | {{ product.title }}</Title>
            <Meta name="description" :content="product.description" />
        </Head>
        <ProductDetails :product="product"/>
    </div>
</template>

<script setup>
const { id } = useRoute().params
const url = `https://fakestoreapi.com/products/${id}`
const { data: product } = await useFetch(url)

definePageMeta({
    layout: 'produkte'
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