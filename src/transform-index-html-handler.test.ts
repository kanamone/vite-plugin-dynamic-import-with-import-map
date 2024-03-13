import { describe, it, expect  } from "vitest";
import { ModuleRepository } from "./module-repository";
import { createOk } from "option-t/PlainResult";
import { BuildDynamicImportModules } from "./build-dynamic-import-modules";
import { transformIndexHtmlHandler } from "./transform-index-html-handler";

describe("transformIndexHtmlHandler", () => {
  describe("when success buildDynamicImportModules and empty importmap", () => {
    it("should be return to import map", async () => {
      class DummyModuleRepository implements ModuleRepository {
        async resolve(name: string) {
          return createOk({
            name: name,
            entryPointPath: `node_modules/${name}/index.js`
          })
        }
      }

      const buildDynamicImportModules: BuildDynamicImportModules = async (modules) => {
        return createOk(modules.map(m => ([m.name, `${m.name}.js`])))
      }

      const actual = await transformIndexHtmlHandler({ buildDynamicImportModules, moduleRepo: new DummyModuleRepository() })([])(null, "<html></html>", { path: '.' })
      expect(actual).toStrictEqual({
        html: "<html></html>",
        tags: [
          {
            tag: 'script',
            attrs: { type: 'importmap' },
            children: JSON.stringify({})
          }
        ]
      })
    })
  })

  describe("when success buildDynamicImportModules and one importmap", () => {
    it("should be return to import map", async () => {
      class DummyModuleRepository implements ModuleRepository {
        async resolve(name: string) {
          return createOk({
            name: name,
            entryPointPath: `node_modules/${name}/index.js`
          })
        }
      }

      const buildDynamicImportModules: BuildDynamicImportModules = async (modules) => {
        return createOk(modules.map(m => ([m.name, `${m.name}.js`])))
      }

      const actual = await transformIndexHtmlHandler({ buildDynamicImportModules, moduleRepo: new DummyModuleRepository() })(["foo"])(null, "<html></html>", { path: '.' })
      expect(actual).toStrictEqual({
        html: "<html></html>",
        tags: [
          {
            tag: 'script',
            attrs: { type: 'importmap' },
            children: JSON.stringify({foo: 'foo.js'})
          }
        ]
      })
    })
  })
})