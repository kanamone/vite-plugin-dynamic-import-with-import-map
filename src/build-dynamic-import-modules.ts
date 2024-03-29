import { Result, createErr, createOk } from "option-t/PlainResult";
import { ConvertToESM } from "./convert-to-esm.js";
import { Module } from "./module.js";
import { FileRepository } from "./file-repository.js";
import { join } from "path";
import { allForResults } from "./all-for-results.js";

type Dependencies = {
  convertToESM: ConvertToESM;
  fileRepository: FileRepository;
};

type BuildDynamicImportModulesError = {
  kind: "TransformError";
  error: unknown;
};

type ModuleName = string;
type TransformedBody = string;
type ImportMapEntry = [ModuleName, TransformedBody];
export type BuildDynamicImportModules = (
  modules: ReadonlyArray<Module>,
  distPath: string,
) => Promise<
  Result<ReadonlyArray<ImportMapEntry>, BuildDynamicImportModulesError>
>;

export const buildDynamicImportModules: (
  deps: Dependencies,
) => BuildDynamicImportModules = (deps) => async (mods, distPath) => {
  const transformedModResults = await Promise.all(mods.map(deps.convertToESM));
  const transformedModsResult = allForResults(transformedModResults);

  if (!transformedModsResult.ok) {
    return createErr({
      kind: "TransformError",
      error: transformedModsResult.err,
    });
  }

  for (const transformedMod of transformedModsResult.val) {
    const fileName = escaapeScopdPackageName(transformedMod.pkgName);
    const dist = join(distPath, `${fileName}.js`);
    await deps.fileRepository.write(dist, transformedMod.body);
  }

  return createOk(
    transformedModsResult.val.map((mod) => {
      const fileName = escaapeScopdPackageName(mod.pkgName);
      return [mod.pkgName, `${fileName}.js`] as const;
    }),
  );
};

const escaapeScopdPackageName = (pkgName: string): string => {
  return pkgName.replace(/\//, "__");
};
