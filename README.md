# @himanoa/vite-plugin-with-import-map

Import some modules via [importmap](https://developer.mozilla.org//docs/Web/HTML/Element/script/type/importmap)

## Features

1. ✅ Auto embed importmap in index.html
1. ✅ Auto generate external modules bundle by esbuild
  1. ✅ Minify
  1. ✅ Inline sourcemap

## Installation 

```sh
npm install @himanoa/vite-plugin-with-import-map
```

## Usage

The following example makes split `react` bundle

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import { dynamicImportWithImportMap } from '@himanoa/vite-plugin-with-import-map'

export default defineConfig({
  plugins: [dynamicImportWithImportMap(['react'])],
})
```

## Caveats

This plugin doesn't work well in serve mode. Because module dependency resolution is done with rollup phase. Vite is skip rollup bundle when serve mode. However embed importmap is worked in serve mode.

