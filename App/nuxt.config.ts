// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
export default defineNuxtConfig({
  modules: ['@nuxtjs/tailwindcss', '@nuxtjs/supabase', 'nuxt-nodemailer'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
      supabase: {
        redirect: false, // Ensure this is set to false
        redirectOptions: {
          login: '/login',
          callback: '/confirm',
          exclude: [],
          cookieRedirect: false
        }
      }
    },
    private: {
      supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY
    }
  },

  nitro: {
    debug: true
  },

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

  // Enable dev tools for better debugging
  devtools: { enabled: true },
  compatibilityDate: '2024-09-25'
})