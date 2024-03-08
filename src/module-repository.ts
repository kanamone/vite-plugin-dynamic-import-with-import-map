import { Result } from "option-t/PlainResult";
import { Module } from "./module";

export type ModuleResolveError =
  | {
      kind: "ModuleIsNotFound";
      name: string;
    }
  | {
      kind: "ModuleIsInvalid";
      name: string;
    };

export interface ModuleRepository {
  resolve(name: string): Promise<Result<Module, ModuleResolveError>>;
}
