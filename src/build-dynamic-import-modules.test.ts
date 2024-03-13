import { describe, it, expect } from 'vitest'
import { ConvertToESM } from './convert-to-esm'
import { Result, createErr, createOk } from 'option-t/PlainResult'
import { Module } from './module'
import { FileRepository, ReadFileError, WriteFileError } from './file-repository'
import { buildDynamicImportModules } from './build-dynamic-import-modules'

class LoggedWriteFileRepository implements FileRepository {
  constructor(private _called: Array<[string, string]> = []) {}

  async read(_path: string):Promise<Result<string, ReadFileError>> {
    throw new Error("unreachable")
  }

  async write(path: string, body: string): Promise<Result<null, WriteFileError>> {
    this._called.push([path, body] as const)
    return createOk(null)
  }

  public get called() {
    return this._called
  }
}

const dummyConvertToESM: ConvertToESM = async (mod: Module) => {
  return createOk({
    pkgName: mod.name,
    body: 'export default function a() { console.log("hello") }'
  })
}

describe("buildDynamicImportModules", () => {
  describe("when all transform successful", () => {
    it("should be return to Ok(ImportMapEntries)", async () => {
      const fileRepo = new LoggedWriteFileRepository()
      const actual = await buildDynamicImportModules({
        fileRepository: fileRepo,
        convertToESM: dummyConvertToESM
      })([{
        name: 'example', entryPointPath: 'node_modules/example/index.js'
      }], '.')
      expect(actual.ok).toStrictEqual(true)
      expect(actual.val).toStrictEqual([['example', 'example.js']])
    })

    it("should be put file to dist directory", async () => {
      const fileRepo = new LoggedWriteFileRepository()
      await buildDynamicImportModules({
        fileRepository: fileRepo,
        convertToESM: dummyConvertToESM
      })([{
        name: 'example', entryPointPath: 'node_modules/example/index.js'
      }], 'dist')
      expect(fileRepo.called).toStrictEqual([[
        "dist/example.js",
        'export default function a() { console.log("hello") }'
      ]])
    })
  })

  describe("when failed transform", () => {
    it("should be return to TransformError", async () => {
      const e = new Error()
      const failConvertToESM: ConvertToESM = async () => {
        return createErr({
          kind: 'TransformError',
          error: e
        })
      }

      const fileRepo = new LoggedWriteFileRepository()
      const actual = await buildDynamicImportModules({
        convertToESM: failConvertToESM,
        fileRepository: fileRepo
      })([{
        name: 'example', entryPointPath: 'node_modules/example/index.js'
      }], './dist')
      expect(actual.err).toStrictEqual({
        kind: 'TransformError',
        error: {
          kind: "TransformError",
          error: e
        }
      })
    })  

    it("should be not write to filesystem", async () => {
      const e = new Error()
      const failConvertToESM: ConvertToESM = async () => {
        return createErr({
          kind: 'TransformError',
          error: e
        })
      }

      const fileRepo = new LoggedWriteFileRepository()
      const actual = await buildDynamicImportModules({
        convertToESM: failConvertToESM,
        fileRepository: fileRepo
      })([{
        name: 'example', entryPointPath: 'node_modules/example/index.js'
      }], './dist')
      expect(fileRepo.called).toStrictEqual([])
    })  
  })
})
