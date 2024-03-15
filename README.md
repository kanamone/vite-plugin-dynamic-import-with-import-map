# @kanamone/vite-plugin-with-import-map

[![npm version](https://badge.fury.io/js/@kanamone%2Fvite-plugin-dynamic-import-with-import-map.svg)](https://badge.fury.io/js/@kanamone%2Fvite-plugin-dynamic-import-with-import-map)
[![test](https://github.com/kanamone/vite-plugin-dynamic-import-with-import-map/actions/workflows/test.yml/badge.svg)](https://github.com/kanamone/vite-plugin-dynamic-import-with-import-map/actions/workflows/test.yml)

Import some modules via [importmap](https://developer.mozilla.org//docs/Web/HTML/Element/script/type/importmap)

## Features

1. ✅ Auto embed importmap in index.html
1. ✅ Auto generate external modules bundle by esbuild
    1. ✅ Minify
    1. ✅ Inline sourcemap

## Installation 

```sh
npm install @kanamone/vite-plugin-with-import-map
```

## Usage

The following example makes split `react` bundle

```ts
// vite.config.ts

import { defineConfig } from 'vite'
import { dynamicImportWithImportMap } from '@kanamone/vite-plugin-with-import-map'

export default defineConfig({
  plugins: [dynamicImportWithImportMap(['react'])],
})
```

## Caveats

Module dependency resolution doesn't work. Because vite is not execute rollup build phase when serve mode.

