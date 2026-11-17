import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_')
  if (mode === 'production' && env.VITE_API_URL) {
    throw new Error('Leave VITE_API_URL empty in production to use the same-origin /api proxy.')
  }
  return {
    plugins: [react()],
    server: { proxy: { '/api': 'http://localhost:5000' } },
  }
})
