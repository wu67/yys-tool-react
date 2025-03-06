import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
// import type { PluginOption } from 'vite'
// import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  return {
    base: mode === 'production' ? '/yys-tool-react/' : '/',
    plugins: [
      react(),
      tailwindcss(),
      // visualizer({
      //   emitFile: true,
      //   filename: 'stats.html',
      // }) as PluginOption,
    ],
    server: { host: '0.0.0.0', port: 8888 },
    resolve: { alias: { '@': '/src/' } },
    css: {
      devSourcemap: true,
      preprocessorOptions: {
        // 可以用来把样式混入每个页面
        scss: {
          api: 'modern',
        },
      },
    },
    build: {
      // 设置最终构建的浏览器兼容目标
      target: 'es2022',
      // 构建后是否生成 source map 文件
      sourcemap: mode !== 'production',
      // 启用/禁用 gzip 压缩大小报告
      reportCompressedSize: mode !== 'development',
      // 单文件输出超出该大小会警告, 单位kb
      chunkSizeWarningLimit: 1000,
      // roolup 配置项. https://rollupjs.org/configuration-options
      rollupOptions: { output: { manualChunks: { antd: ['antd'] } } },
    },
  }
})
