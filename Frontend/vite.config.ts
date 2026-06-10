import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import fs from 'fs'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_TARGET || 'http://localhost:5000'
  const esMobile = env.VITE_APP_MOBILE_CLIENTE === 'true'

  const keyPath = path.resolve(process.cwd(), './certs/localhost-key.pem')
  const certPath = path.resolve(process.cwd(), './certs/localhost.pem')

  const httpsConfig =
    fs.existsSync(keyPath) && fs.existsSync(certPath)
      ? {
        key: fs.readFileSync(keyPath),
        cert: fs.readFileSync(certPath),
      }
      : undefined

  return {
    base: esMobile ? './' : '/',

    build: {
      target: ['chrome87', 'es2020'],
    },

    plugins: [
      vue(),
      tailwindcss(),
    ],

    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },

    server: {
      host: '0.0.0.0',
      port: 5173,
      allowedHosts: ['localhost', '.nip.io'],
      https: httpsConfig,
      proxy: {
        '/api-tenant': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-tenant/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.setHeader('x-forwarded-host', req.headers.host || '')
            })
          },
        },
        '/api-admin': {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-admin/, ''),
          configure: (proxy) => {
            proxy.on('proxyReq', (proxyReq, req) => {
              proxyReq.setHeader('x-forwarded-host', req.headers.host || '')
            })
          },
        },
        '/api-vision': {
          target: env.VITE_VISION_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api-vision/, ''),
        },
      },
    },
  }
})
