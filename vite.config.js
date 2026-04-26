import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        cleanupOutdatedCaches: true,
        clientsClaim: true,
        skipWaiting: true,
      },
      includeAssets: [
        'favicon-optimized.svg',
        'icon-platform.png',
        'icon-dashboard.png',
        'icon-booking.png',
        'logo.png',
        'manifest-platform.json',
        'manifest-dashboard.json',
      ],
      manifest: {
        name: 'Shafar - Gestão de Barbearias',
        short_name: 'Shafar',
        description: 'Plataforma inteligente para gestão de barbearias e agendamentos.',
        theme_color: '#c09a5c',
        background_color: '#0d0d0d',
        display: 'standalone',
        start_url: '/#/',
        scope: '/',
        icons: [
          {
            src: 'favicon-optimized.svg',
            sizes: 'any',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
  test: {
    environment: 'node',
    globals: false,
    include: ['src/**/*.test.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/contexts': path.resolve(__dirname, './src/contexts'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/utils': path.resolve(__dirname, './src/utils')
    }
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['styled-components'],
          'date-vendor': ['date-fns', 'react-calendar'],
          'supabase-vendor': ['@supabase/supabase-js']
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000
  }
});