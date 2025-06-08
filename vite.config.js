import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';

export default defineConfig({
  base: '/torq-test/',
  plugins: [
    vue(),
    vueDevTools(),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@use "@/assets/styles/variables.scss" as *;`
      }
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,

    root: './',

    include: [ 'src/**/*.{test,spec}.{js,ts,vue}' ],
    coverage: {
      provider: 'istanbul',
      include: [ 'src/**/*.{ts,vue}' ],
      exclude: [ 'node_modules', 'tests' ]
    }
  }
});
