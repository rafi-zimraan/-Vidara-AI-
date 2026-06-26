export default defineNuxtConfig({
  compatibilityDate: '2026-06-26',
  future: { compatibilityVersion: 4 },

  srcDir: 'app',

  modules: [
    '@nuxtjs/supabase',
    '@nuxtjs/tailwindcss',
    '@vueuse/nuxt',
  ],

  supabase: {
    redirect: false,
    url: process.env.SUPABASE_URL || '',
    key: process.env.ANON_KEY || '',
    serviceKey: process.env.SUPABASE_SERVER_ROLE_KEY || '',
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
    '/dashboard/**': { ssr: false },
    '/projects/**': { ssr: false },
    '/api/**': { cors: true },
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    public: {
      supabaseUrl: process.env.SUPABASE_URL || '',
      supabaseKey: process.env.ANON_KEY || '',
    },
    supabaseServiceKey: process.env.SUPABASE_SERVER_ROLE_KEY || '',
  },

  devtools: { enabled: true },
})
