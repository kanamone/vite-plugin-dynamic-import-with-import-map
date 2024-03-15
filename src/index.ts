import { transformIndexHtmlHandler } from "./transform-index-html-handler.js";
import { buildDynamicImportModules } from "./build-dynamic-import-modules.js";
import { convertToESM } from "./convert-to-esm.js";
import { FsFileRepository } from "./fs-file-repository.js";
import { NodeModuleRepository } from "./node-module-repository.js";
import { Plugin } from "vite";

export const dynamicImportWithImportMap = (options: string[] = []): Plugin => {
  const fileRepository = new FsFileRepository()
  const handler = transformIndexHtmlHandler({
    buildDynamicImportModules: buildDynamicImportModules({
      convertToESM: convertToESM(),
      fileRepository
    }),
    moduleRepo: new NodeModuleRepository(fileRepository)
  })

  return {
    name: 'vite-plugin-dynamic-import-with-import-map',
    enforce: "post",
    transformIndexHtml: {
      order: "pre",
      handler: handler(options)
    },
    closeBundle: () => {
      console.log("hello")
      fileRepository.persist('.')
    }
  }
};
