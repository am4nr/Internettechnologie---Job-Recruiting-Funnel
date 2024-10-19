<script setup>
  const supabase = useSupabaseClient()
  const kommentar = ref("")
  const successMsg = ref(null)
  const errorMsg = ref(null)
  async function postComment() {
    try {
        const {data, error} = await supabase.from("Bewerbungen").insert({
          kommentar: kommentar.value,
        })
        if (error) throw error
        successMsg.value = "Kommentar wurde gespeichert"
    } catch (error) {
        errorMsg.value = error.message
    }
  }
</script>
<template>
    <div class="flex justify-center">
      <div class="w-full max-w-md p-8 space-y-3 rounded-xl bg-white shadow-md">
        <h1 class="text-2xl font-bold text-center">Kommentar</h1>
        <h3 class="text-red-500">{{ errorMsg }}</h3>
        <form class="space-y-6" action="#" method="POST" @submit.prevent="postComment">
          <div>
            <label for="email" class="text-sm font-semibold">Gib einen Kommentar ein:</label>
            <input type="text" id="kommentar" placeholder="Text" v-model="kommentar"
              class="w-full p-2 mt-1 border rounded-md focus:border-blue-400 focus:outline-none focus:ring focus:ring-blue-300" />
          </div>
          <button type="submit"
            class="w-full py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
            Absenden
          </button>
          <h3 class="text-green-500">{{ successMsg }}</h3>
        </form>
      </div>
    </div>
</template>