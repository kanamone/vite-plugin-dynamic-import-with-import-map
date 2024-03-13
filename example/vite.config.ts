import { defineConfig } from 'vite'
import { dynamicImportWithImportMap } from '../src/index.js'

export default defineConfig({
  plugins: [
    dynamicImportWithImportMap(["react"])
  ]
})
