import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://46.202.149.63',
        changeOrigin: true,
        secure: false, // desabilita verificação SSL (certificado autoassinado)
      },
    },
  },
})
