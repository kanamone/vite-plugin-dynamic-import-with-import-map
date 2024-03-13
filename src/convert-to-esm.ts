import { transform } from 'esbuild'
import { Module } from './module'
import { FileRepository } from './file-repository'
import { Result, createErr, createOk } from 'option-t/PlainResult'
import { tryCatchIntoResultAsync } from 'option-t/PlainResult/tryCatchAsync'

type Dependencies = {
  fileRepository: FileRepository
}

export type ConvertToESMError = {
  kind: "EntryPointIsNotFound",
  name: string,
  path: string
} | {
  kind: 'TransformError',
  error: unknown
}

export type ConvertedResult = {
  pkgName: string,
  body: string
}

export type ConvertToESM = (mod: Module) => Promise<Result<ConvertedResult, ConvertToESMError>>
export const convertToESM: (deps: Dependencies) => ConvertToESM = (deps) => async (mod: Module) => {
  const entryPointSourceCodeResult = await deps.fileRepository.read(mod.entryPointPath)

  if(!entryPointSourceCodeResult.ok) {
    return  createErr({
      kind: 'EntryPointIsNotFound',
      name: mod.name,
      path: mod.entryPointPath
    })
  }

  const transformedSourceCodeResult = await tryCatchIntoResultAsync(() => transform(entryPointSourceCodeResult.val, {
    loader: 'tsx',
    sourcemap: 'inline',
    format: 'esm',
    platform: 'browser',
    minify: true,
    minifyWhitespace: true,
    minifyIdentifiers: false,
  }))

  if(!transformedSourceCodeResult.ok) {
    return createErr({
      kind: 'TransformError',
      pkgName: mod.name,
      error: transformedSourceCodeResult.err
    })
  }

  return createOk({
    pkgName: mod.name,
    body: transformedSourceCodeResult.val.code
  })
}
