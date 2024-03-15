import { describe, it, expect } from 'vitest'
import { convertToESM } from './convert-to-esm.js'

describe("convertToESM", () => {
  describe("when invalid js file", () => {
    it("should be return to Err", async () => {
      const actual = await convertToESM()({
        name: 'xxx',
        entryPointPath: 'foo'
      })
      expect(actual.err).toMatchInlineSnapshot(`
        {
          "error": [Error: Build failed with 1 error:
        error: Could not resolve "foo"],
          "kind": "TransformError",
          "pkgName": "xxx",
        }
      `)
    })
  })

  describe("when success", () => {
    it("should be return to Ok", async () => {
      const actual = await convertToESM()({
        name: 'vite',
        entryPointPath: 'src/module.ts'
      })
      expect(actual.ok).toStrictEqual(true)
    })
  })
})
