import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  test: {
    globals: true,          // allows using `expect` without importing
    environment: 'jsdom',   // simulate browser environment
    setupFiles: './src/setupTests.js', // optional, for global test setup
  },
})
