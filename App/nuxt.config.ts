// https://nuxt.com/docs/api/configuration/nuxt-config
// nuxt.config.ts
export default defineNuxtConfig({
  nitro: {
    preset: 'node-server',
    debug: true
  },
  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/supabase',
    '@formkit/nuxt',
    'nuxt-nodemailer',
  ],

  supabase: {
    clientOptions: {
      auth: {
        flowType: 'implicit',
        autoRefreshToken: true,
        detectSessionInUrl: true,
        persistSession: true,
        storage: {
          getItem: (key) => globalThis.localStorage?.getItem(key),
          setItem: (key, value) => globalThis.localStorage?.setItem(key, value),
          removeItem: (key) => globalThis.localStorage?.removeItem(key),
        }
      },
      realtime: {
        params: {
          eventsPerSecond: 0
        }
      },
      global: {
        headers: {
          'x-my-custom-header': 'my-app-name'
        }
      }
    },
    redirect: false,
    cookieOptions: {
      maxAge: 60 * 60 * 4,
      sameSite: 'lax',
      secure: true
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

  app: {
    head: {
      title: 'Kistenkönige Logistik',
      meta: [
        { name: 'description', content: 'Ihr zuverlässiger Partner für Dienstleistungen, z. B. Transporte, Logistik oder ähnliche Angebote' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css' }
      ]
    },
    layoutTransition: { name: 'layout', mode: 'out-in' }
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
      }
    ]
  },

  plugins: [],
  css: [
    'daisyui/dist/full.css',
    '@fortawesome/fontawesome-free/css/all.min.css',
    '~/assets/css/tailwind.css',
  ],

  formkit: {
    configFile: './formkit.config.ts'
  },
})