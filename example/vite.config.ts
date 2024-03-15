import { defineConfig } from 'vite'
import { dynamicImportWithImportMap } from '../src/index.js'

export default defineConfig({
  build: {
    rollupOptions: {
      external: ['react']
    }
  },
  plugins: [
    dynamicImportWithImportMap(["react"]) as any
  ],
})
