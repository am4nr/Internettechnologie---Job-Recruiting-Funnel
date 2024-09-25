<template>
    <div class="card">
        <div class="grid grid-cols-2 gap-10">
            <div class="p-7">
                <img :src="product.image" alt="product img" class="mx-auto my-7">
            </div>
            <div class="p-7">
                <h2 class="text-4xl my-7">{{ product.title }}</h2>
                <p class="text-xl my-7">Preis: {{ formatPrice(product.price) }} Euro</p>
                <h3 class="font-bold border-b-2 mb-4 pb-2">Produktinformation</h3>
                <p class="mb-7">{{ product.description }}</p>
                <button class="btn flex">
                    <i class="fa-solid fa-cart-shopping mr-2"></i>
                    <span>Zum Warenkorb</span>
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    const { product } = defineProps(['product'])
    if (!(product.title)) {
        throw createError({ statusCode: 404, statusMessage: 'Produkt nicht gefunden', fatal: true})
    }
    const formatPrice = (price) => {
        if (price) {
            return price.toFixed(2).replace('.', ',');
        } else {
            return;
        }
        
    };

    useHead({
      title: 'Mein Shop | ' + product.title,
      meta: [
        { name: 'description', content: product.description }
      ]
    })

</script>

<style scoped>
    img {
        max-width: 400px;
    }
</style>