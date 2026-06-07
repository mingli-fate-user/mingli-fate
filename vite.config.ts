import devServer from "@hono/vite-dev-server"
import path from "path"
const __dirname = import.meta.dirname
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"
import { inspectAttr } from 'kimi-plugin-inspect-react'

// https://vite.dev/config/
export default defineConfig({
  base: './',
  plugins: [
    devServer({ entry: "api/boot.ts", exclude: [/^\/(?!api\/).*$/] }),
    inspectAttr(), react()],
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@contracts": path.resolve(__dirname, "./contracts"),
      "@db": path.resolve(__dirname, "./db"),
      "db": path.resolve(__dirname, "./db"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        // 代码分割：将大型依赖包拆分到单独的 chunk
        manualChunks(id) {
          // 将 node_modules 中的依赖拆分成单独的 chunk
          if (id.includes('node_modules')) {
            if (id.includes('react-router')) return 'router';
            if (id.includes('lucide')) return 'icons';
            if (id.includes('react')) return 'react-vendor';
            return 'vendor';
          }
        },
      },
    },
    // 开启 CSS 代码分割
    cssCodeSplit: true,
    // 目标浏览器
    target: 'es2015',
    // 压缩选项
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      } as any,
    } as any,
  },
  envDir: path.resolve(__dirname),
});
