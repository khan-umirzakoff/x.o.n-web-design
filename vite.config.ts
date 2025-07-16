import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
      plugins: [
        react({
          babel: {
            plugins: [
              ["babel-plugin-react-compiler", {}]
            ]
          }
        })
      ],
      define: {
      },
      resolve: {
        alias: {
          '@': fileURLToPath(new URL('.', import.meta.url)),
        }
      },
      build: {
        rollupOptions: {
          output: {
            manualChunks: {
              vendor: ['react', 'react-dom'],
            },
          },
        },
      },
      server: {
        port: 3000,
        open: true,
      },
});

