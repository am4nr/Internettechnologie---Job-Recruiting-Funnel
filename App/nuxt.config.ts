// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
export default defineNuxtConfig({
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    'nuxt-nodemailer',
  ],

  supabase: {
    redirect: false,
    redirectOptions: {
      login: '/auth/login',
      callback: '/auth/confirm',
      exclude: [],
    },
    cookieOptions: {
      name: 'sb-auth',
      lifetime: 60 * 60 * 8, // 8 hours
      domain: '',
      path: '/',
      sameSite: 'lax'
    }
  },

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL,
      supabaseKey: process.env.SUPABASE_KEY,
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
  compatibilityDate: '2024-09-25',

  components: {
    dirs: [
      {
        path: '~/components',
        pathPrefix: false,
      },
      {
        path: '~/components/navigation',
        pathPrefix: false,
      },
      {
        path: '~/composables',
        pathPrefix: false,
      }
    ]
  },

  plugins: ['~/plugins/Vue3Lottie.client.ts'],
  css: [
    'daisyui/dist/full.css',
    '@fortawesome/fontawesome-free/css/all.min.css',
    '~/assets/css/tailwind.css',
  ],
})