// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from '@tailwindcss/vite';
import { qrcode } from 'vite-plugin-qrcode';
import { networkInterfaces } from 'node:os';

// Dynamic LAN IP detection
const localIp =
  Object.values(networkInterfaces())
    .flat()
    .find((details) => details?.family === 'IPv4' && !details.internal)?.address || 'localhost';

export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  future: {
    compatibilityVersion: 4
  },
  devtools: { enabled: true },
  css: ['./app/assets/css/main.css'],

  devServer: {
    host: '0.0.0.0',
    port: 3000
  },

  vite: {
    plugins: [tailwindcss(), qrcode()],
    server: {
      allowedHosts: true,
      hmr: {
        protocol: 'ws',
        host: localIp,
        port: 24678
      }
    },
    optimizeDeps: {
      include: ['@supabase/supabase-js']
    }
  },

  modules: [
    '@nuxtjs/supabase',
    '@nuxt/eslint',
    '@nuxt/hints',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@vueuse/nuxt',
    '@nuxtjs/i18n',
    '@nuxt/fonts',
    'nuxt-security'
  ],

  security: {
    headers: {
      contentSecurityPolicy: {
        'img-src': ["'self'", 'data:', 'https://*.supabase.co'],
        'connect-src': [
          "'self'",
          'https://*.supabase.co',
          'wss://*.supabase.co',
          process.env.NODE_ENV === 'development' ? `http://${localIp}:*` : '',
          process.env.NODE_ENV === 'development' ? `ws://${localIp}:*` : ''
        ].filter(Boolean),
        'upgrade-insecure-requests': process.env.NODE_ENV === 'production'
      },
      strictTransportSecurity: {
        maxAge: 31536000,
        preload: true
      }
    }
  },

  // Disable strict HSTS in dev to avoid issues
  $development: {
    security: {
      headers: {
        strictTransportSecurity: false
      }
    }
  },

  supabase: {
    types: '@@/shared/types/database.types.ts',
    redirect: true,
    redirectOptions: {
      login: '/auth/login',
      callback: '/confirm',
      exclude: ['/', '/auth/login', '/auth/forgot-password', '/auth/update-password']
    },
    cookieOptions: {
      secure: process.env.NODE_ENV === 'production'
    }
  },

  i18n: {
    locales: [
      { code: 'en', file: 'en.json', name: 'English' },
      { code: 'de', file: 'de.json', name: 'Deutsch' },
      { code: 'fr', file: 'fr.json', name: 'Français' },
      { code: 'es', file: 'es.json', name: 'Español' }
    ],
    defaultLocale: 'en',
    strategy: 'no_prefix',
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: 'i18n_redirected',
      redirectOn: 'root' // recommended
    }
  },
  build: {
    transpile: ['vue-echarts', 'echarts']
  }
});
