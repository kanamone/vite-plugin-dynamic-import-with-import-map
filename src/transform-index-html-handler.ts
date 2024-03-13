import { allForResults } from "./all-for-results"
import { BuildDynamicImportModules } from "./build-dynamic-import-modules"
import { ModuleRepository } from "./module-repository"

export type HtmlTagDescriptor =  {
  tag: string
  attrs?: Record<string, string | boolean | undefined>
  children?: string
}

export type TransformIndexHtmlHandler = (
  _this: void | null,
  html: string,
  ctx: { path: string }
) => Promise<{html: string, tags: HtmlTagDescriptor[]}>

type Dependencies = {
  buildDynamicImportModules: BuildDynamicImportModules,
  moduleRepo: ModuleRepository
}

export const transformIndexHtmlHandler: (deps: Dependencies) => (options: string[]) => TransformIndexHtmlHandler = (deps) =>  options => async (_, html, { path }) => {
  const mods = await Promise.all(options.map(modName => deps.moduleRepo.resolve(modName)))
  const modsResult = allForResults(mods)
  if(!modsResult.ok) {
    throw modsResult.err
  }
  const entries = await deps.buildDynamicImportModules(modsResult.val, path)
  if(!entries.ok) {
    throw entries.err
  }
  const importMap = entries.val.reduce<Record<string, string>>(((acc, [name, path]) => ({ ...acc, [name]: path })), {})

  return {
    html: html,
    tags: [
      {
        tag: 'script',
        attrs: { type: 'importmap' },
        children: JSON.stringify(importMap),
      }
    ]
  }
}
