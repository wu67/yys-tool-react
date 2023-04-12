import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/yys-tool-react/' : '/',
    plugins: [react()],
    server: {
      host: '0.0.0.0',
      port: 8888,
    },
    resolve: {
      alias: {
        '@': '/src/',
      },
    },
  }
})
