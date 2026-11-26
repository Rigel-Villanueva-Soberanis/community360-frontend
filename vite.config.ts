import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'


export default defineConfig({
  // HTTPS local con certificado de confianza (la API corre en https://localhost:7043).
  // mkcert solo actúa en `npm run dev`. Se omite en las pruebas y con SIN_HTTPS=1 (solo para entornos sin acceso a GitHub).
  plugins: [vue(), ...(process.env.VITEST || process.env.SIN_HTTPS ? [] : [mkcert()])],
  server: { port: 5173, strictPort: true },
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
