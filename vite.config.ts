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
    css: {
      devSourcemap: true,
    },
    build: {
      // 设置最终构建的浏览器兼容目标
      target: 'es2015',
      // 构建后是否生成 source map 文件
      sourcemap: mode !== 'production',
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: mode === 'production',
    },
  }
})
