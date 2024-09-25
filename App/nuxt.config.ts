// https://nuxt.com/docs/api/configuration/nuxt-config
// devtools: { enabled: true }
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss'],

  app: {
    head: {
      title: 'Mein Shop',
      meta: [
        { name: 'description', content: 'Tolle Dinge bei uns' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' }
      ]
    }
  },

  compatibilityDate: '2024-09-25'
})