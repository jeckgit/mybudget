// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],
  vite: {
    plugins: [tailwindcss()]
  },
  modules: [
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@vueuse/nuxt',
    '@nuxtjs/supabase',
    '@nuxtjs/i18n',
    '@nuxtjs/color-mode'
  ],

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'de', file: 'de.json', name: 'Deutsch' },
      { code: 'fr', file: 'fr.json', name: 'Français' },
      { code: 'es', file: 'es.json', name: 'Español' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix'
  },

  colorMode: {
    classSuffix: '',
    preference: 'system',
    fallback: 'light'
  },
  build: {
    transpile: ['vue-echarts', 'echarts']
  }
});
