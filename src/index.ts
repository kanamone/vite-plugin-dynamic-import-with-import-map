import { Plugin } from 'vite'
import { transformIndexHtmlHandler } from "./transform-index-html-handler.js";
import { buildDynamicImportModules } from "./build-dynamic-import-modules.js";
import { convertToESM } from "./convert-to-esm.js";
import { FsFileRepository } from "./fs-file-repository.js";
import { NodeModuleRepository } from "./node-module-repository.js";

export const dynamicImportWithImportMap = (options: string[] = []): Plugin => {
  const fileRepository = new FsFileRepository()
  const handler = transformIndexHtmlHandler({
    buildDynamicImportModules: buildDynamicImportModules({
      convertToESM: convertToESM({
        fileRepository
      }),
      fileRepository
    }),
    moduleRepo: new NodeModuleRepository(fileRepository)
  })

  return {
    name: 'vite-plugin-dynamic-import-with-import-map',
    transformIndexHtml: {
      enforce: "pre",
      handler: handler(options)
    }
  }
};
