export default defineNuxtConfig({
  compatibilityDate: '2026-06-26',
  future: { compatibilityVersion: 4 },

  srcDir: 'app',

  modules: [
    '@nuxtjs/supabase',
    '@vueuse/nuxt',
  ],

  postcss: {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  },

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || '',
    key: process.env.ANON_KEY || '',
    secretKey: process.env.SUPABASE_SERVER_ROLE_KEY || '',
  },

  nitro: {
    preset: 'node-server',
    experimental: {
      openAPI: true,
    },
    imports: {
      dirs: ['server/utils'],
    },
  },

  routeRules: {
    '/': { prerender: true },
    '/auth/**': { ssr: false },
    '/dashboard': { ssr: false },
    '/generate': { ssr: false },
    '/pipeline': { ssr: false },
    '/pipeline/**': { ssr: false },
    '/review': { ssr: false },
    '/review/**': { ssr: false },
    '/publish': { ssr: false },
    '/publish/**': { ssr: false },
    '/assets': { ssr: false },
    '/analytics': { ssr: false },
    '/billing': { ssr: false },
    '/projects/**': { ssr: false },
    '/api/**': { cors: true },
  },

  app: {
    head: {
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700;800&display=swap',
        },
      ],
    },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.ANON_KEY || '',
    },
    supabaseServiceKey: process.env.SUPABASE_SERVER_ROLE_KEY || '',
    seedSecret: process.env.SEED_SECRET || 'vidara-seed-2026',
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    elevenlabsApiKey: process.env.ELEVENLABS_API_KEY || '',
    replicateApiKey: process.env.REPLICATE_API_KEY || '',
  },

  devtools: { enabled: true },
})
