import { describe, it, expect } from 'vitest'
import { convertToESM } from './convert-to-esm'
import { FileRepository, WriteFileError } from './file-repository'
import { Result, createErr, createOk } from 'option-t/PlainResult'

describe("convertToESM", () => {
  describe("when failed open entry path file", () => {
    it("should be return to Err(EntryPointIsNotFound)", async () => {
      class DummyFileRepository implements FileRepository {
        async read(path: string) {
          return createErr({
            kind: "FailedOpenFile",
            path: path
          } as const)
        }
        async write(_path: string, _body: string): Promise<Result<void, WriteFileError >> {
          throw new Error("unreacheble")
        }
      }
      const actual = await convertToESM({fileRepository: new DummyFileRepository()})({
        name: 'xxx',
        entryPointPath: 'foo'
      })
      expect(actual.err).toStrictEqual({
        kind: 'EntryPointIsNotFound',
        name: 'xxx',
        path: "foo"
      })
    })
  })

  describe("when invalid js file", () => {
    it("should be return to Err", async () => {
      class DummyFileRepository implements FileRepository {
        async read(path: string) {
          return createOk("console.)")
        }
        async write(_path: string, _body: string): Promise<Result<void, WriteFileError >> {
          throw new Error("unreacheble")
        }
      }
      const actual = await convertToESM({fileRepository: new DummyFileRepository()})({
        name: 'xxx',
        entryPointPath: 'foo'
      })
      expect(actual.err).toMatchInlineSnapshot(`
        {
          "error": [Error: Transform failed with 1 error:
        <stdin>:1:8: ERROR: Expected identifier but found ")"],
          "kind": "TransformError",
          "pkgName": "xxx",
        }
      `)
    })
  })

  describe("when success", () => {
    it("should be return to Ok", async () => {
      class DummyFileRepository implements FileRepository {
        async read(_path: string) {
          return createOk("console.log('hello')")
        }
        async write(_path: string, _body: string): Promise<Result<void, WriteFileError >> {
          throw new Error("unreacheble")
        }
      }
      const actual = await convertToESM({fileRepository: new DummyFileRepository()})({
        name: 'xxx',
        entryPointPath: 'foo'
      })
      expect(actual.ok).toStrictEqual(true)
      expect(actual.val?.body).toMatch('console.log("hello")')
      expect(actual.val?.pkgName).toMatch('xxx')
    })

    it("should be return to Ok when cjs module", async () => {
      class DummyFileRepository implements FileRepository {
        async read(_path: string) {
          return createOk("module.exports = function add(a: number, b: number) { return a + b }")
        }
        async write(_path: string, _body: string): Promise<Result<void, WriteFileError >> {
          throw new Error("unreacheble")
        }
      }
      const actual = await convertToESM({fileRepository: new DummyFileRepository()})({
        name: 'xxx',
        entryPointPath: 'foo'
      })
      expect(actual.ok).toStrictEqual(true)
      expect(actual.val?.body).toMatch(`var t=(r,n)=>()=>(n||r((n={exports:{}}).exports,n),n.exports);var b=t((m,e)=>{e.exports=function(n,u){return n+u}});export default b();`)
      expect(actual.val?.pkgName).toMatch('xxx')
    })
  })
})
