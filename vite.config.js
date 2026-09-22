import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.VITE_API_BASE_URL?.trim() || 'http://127.0.0.1:8787'

  return {
    plugins: [react()],
    server: {
      proxy: apiTarget
        ? {
            '/api': {
              target: apiTarget,
              changeOrigin: true,
            },
          }
        : {},
    },
  }
})
