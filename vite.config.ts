import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      build: {
        // Otimizações para produção
        target: 'esnext',
        minify: 'esbuild',
        sourcemap: false,
        rollupOptions: {
          output: {
            // Code splitting para melhor performance
            manualChunks: {
              // Vendor chunks
              'react-vendor': ['react', 'react-dom'],
              'router-vendor': ['react-router-dom'],
              'ui-vendor': ['styled-components'],
              'date-vendor': ['date-fns', 'react-calendar'],
              'supabase-vendor': ['@supabase/supabase-js']
            },
            // Nomes de arquivo com hash para cache
            chunkFileNames: 'assets/[name]-[hash].js',
            entryFileNames: 'assets/[name]-[hash].js',
            assetFileNames: 'assets/[name]-[hash].[ext]'
          }
        },
        // Aumentar limite de aviso para 1MB
        chunkSizeWarningLimit: 1000
      },
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
