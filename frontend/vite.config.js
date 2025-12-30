import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    proxy: {
      // Proxy API requests to the Node backend on port 5000
      '/api': 'http://127.0.0.1:5000',
      '/appointments': 'http://127.0.0.1:5000',
      '/departments': 'http://127.0.0.1:5000'
    }
  }
})
