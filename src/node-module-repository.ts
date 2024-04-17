import { dirname, join, relative } from "path";
import { FileRepository } from "./file-repository.js";
import { ModuleRepository, ModuleResolveError } from "./module-repository.js";
import { cwd } from "process";
import {
  Result,
  andThenForResult,
  createErr,
  createOk,
  mapForResult,
  mapOrElseForResult,
} from "option-t/PlainResult";
import { okOrForUndefinable } from "option-t/Undefinable/okOr";
import { Module } from "./module.js";
import resolvePackagePath from "resolve-package-path";

export const isESM = (obj: Record<string, string | undefined>) => {
  return obj["type"] === "module";
};

type GetEntryPointPathError = {
  kind: "invalidPackage";
  name: string;
};
export const getEntryPointPath = (
  name: string,
  modulePath: string,
  obj: Record<string, string | undefined>,
): Result<string, GetEntryPointPathError> => {
  const err: GetEntryPointPathError = {
    kind: "invalidPackage",
    name: name,
  };
  return mapForResult(
    isESM(obj)
      ? okOrForUndefinable(obj["module"], err)
      : okOrForUndefinable(obj["main"], err),
    (relativePath) => {
      return join(modulePath, relativePath);
    },
  );
};
export class NodeModuleRepository implements ModuleRepository {
  constructor(private fsRepo: FileRepository) {}

  async resolve(name: string) {
    const path = resolvePackagePath(name, cwd()) || "";
    const modulePath = relative(cwd(), dirname(path));
    const packageJsonPath = join(modulePath, "package.json");

    const pkg = mapOrElseForResult(
      await this.fsRepo.read(packageJsonPath),
      () =>
        createErr({
          kind: "ModuleIsNotFound" as const,
          name,
        }),
      (x): Result<Record<string, string>, ModuleResolveError> =>
        createOk(JSON.parse(x)),
    );
    if (pkg.err) {
      return pkg;
    }

    const entryPointRelativePath = andThenForResult(pkg, (p) => {
      return getEntryPointPath(name, modulePath, p);
    });
    return mapOrElseForResult(
      entryPointRelativePath,
      () =>
        createErr({
          kind: "ModuleIsInvalid" as const,
          name,
        }),
      (p): Result<Module, ModuleResolveError> => {
        return createOk({
          name,
          entryPointPath: p,
          moduleType: isESM(pkg.val) ? "esm" : "cjs",
        });
      },
    );
  }
}
