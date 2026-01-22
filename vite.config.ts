// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'
import { apiPlugin } from './src/plugins/apiPlugin'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  plugins: [react(), apiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(rootDir, './src'),
    },
  },
  server: {
    port: 5000,
    host: true,
  },
  optimizeDeps: {
    exclude: [
      'coze-coding-dev-sdk',
      'pg',
      'drizzle-orm',
      /src\/storage\/database/,
      /src\/api\/dataApi/
    ],
  },
  build: {
    rollupOptions: {
      external: [
        'coze-coding-dev-sdk',
        'pg',
        'drizzle-orm',
        /src\/storage\/database/,
        /src\/api\/dataApi/
      ],
    },
  },
})
