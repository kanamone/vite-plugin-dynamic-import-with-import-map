import { transformIndexHtmlHandler } from "./transform-index-html-handler.js";
import { buildDynamicImportModules } from "./build-dynamic-import-modules.js";
import { convertToESM } from "./convert-to-esm.js";
import { FsFileRepository } from "./fs-file-repository.js";
import { NodeModuleRepository } from "./node-module-repository.js";
import { PluginOption } from "vite";

export type External = string[]

export const dynamicImportWithImportMap = (options: External): PluginOption => {
  const fileRepository = new FsFileRepository();
  const handler = transformIndexHtmlHandler({
    buildDynamicImportModules: buildDynamicImportModules({
      convertToESM: convertToESM(),
      fileRepository,
    }),
    moduleRepo: new NodeModuleRepository(fileRepository),
  });

  return [{
    name: "vite-plugin-dynamic-import-with-import-map",
    enforce: "post",
    transformIndexHtml: {
      order: "pre",
      handler: handler(options),
    },
    closeBundle() {
      fileRepository.persist(".");
      for (const [fileName] of fileRepository.instructions) {
        this.info?.(`${fileName} is generated`);
      }
    },
  }];
};
