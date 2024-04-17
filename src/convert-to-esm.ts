import { build } from "esbuild";
import { Module } from "./module.js";
import { Result, createErr, createOk } from "option-t/PlainResult";
import { tryCatchIntoResultAsync } from "option-t/PlainResult/tryCatchAsync";
import esbuldNamedExportsPlugin from "esbuild-plugin-named-exports";

export type ConvertToESMError =
  | {
      kind: "EntryPointIsNotFound";
      name: string;
      path: string;
    }
  | {
      kind: "TransformError";
      error: unknown;
    };

export type ConvertedResult = {
  pkgName: string;
  body: string;
};

export type ConvertToESM = (
  mod: Module,
  external: string[],
) => Promise<Result<ConvertedResult, ConvertToESMError>>;
export const convertToESM: () => ConvertToESM =
  () => async (mod: Module, external: string[]) => {
    const plugins = mod.moduleType === "cjs" ? [esbuldNamedExportsPlugin] : [];
    const transformedSourceCodeResult = await tryCatchIntoResultAsync(() =>
      build({
        plugins,
        entryPoints: [mod.entryPointPath],
        bundle: true,
        sourcemap: "inline",
        format: "esm",
        platform: "browser",
        minify: true,
        minifyWhitespace: true,
        minifyIdentifiers: false,
        write: false,
        external,
      }),
    );

    if (
      !transformedSourceCodeResult.ok ||
      transformedSourceCodeResult.val.outputFiles == undefined
    ) {
      return createErr({
        kind: "TransformError",
        pkgName: mod.name,
        error: transformedSourceCodeResult.err,
      });
    }

    return createOk({
      pkgName: mod.name,
      body: transformedSourceCodeResult.val.outputFiles[0].text || "",
    });
  };
