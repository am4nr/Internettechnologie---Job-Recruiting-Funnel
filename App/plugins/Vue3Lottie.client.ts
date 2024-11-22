// plugins/Vue3Lottie.client.ts
import { Vue3Lottie } from 'vue3-lottie'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Vue3Lottie', Vue3Lottie)
})