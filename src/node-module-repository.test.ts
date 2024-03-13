import { describe, it, expect } from "vitest";
import { NodeModuleRepository } from "./node-module-repository.js";
import { FileRepository, WriteFileError } from "./file-repository.js";
import { Result, createErr, createOk } from "option-t/PlainResult";

describe("NodeModuleRepository", () => {
  describe("#resolve", () => {
    describe("when exist module in dependencies", () => {
      describe("when load valid esm package", () => {
        it("should be return to Ok and module", async () => {
          class DummyFileRepository implements FileRepository {
            constructor() {}
            async read() {
              return createOk(
                JSON.stringify({
                  name: "foo",
                  type: "module",
                  module: "./foo.js",
                  main: "./main.js",
                }),
              );
            }

            async write(
              _path: string,
              _body: string,
            ): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).val).toStrictEqual({
            name: "foo",
            entryPointPath: "node_modules/foo/foo.js",
          });
        });
      });

      describe("when load valid cjs package", () => {
        it("should be return to Ok and module", async () => {
          class DummyFileRepository implements FileRepository {
            constructor() {}
            async read() {
              return createOk(
                JSON.stringify({
                  name: "foo",
                  module: "./foo.js",
                  main: "./main.js",
                }),
              );
            }

            async write(
              _path: string,
              _body: string,
            ): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).val).toStrictEqual({
            name: "foo",
            entryPointPath: "node_modules/foo/main.js",
          });
        });
      });

      describe("when load invalid package", () => {
        it("should be return to Err", async () => {
          class DummyFileRepository implements FileRepository {
            constructor() {}
            async read() {
              return createOk(
                JSON.stringify({
                  name: "foo",
                  type: "module",
                  main: "./main.js",
                }),
              );
            }

            async write(
              _path: string,
              _body: string,
            ): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).err).toStrictEqual({
            kind: "ModuleIsInvalid",
            name: "foo",
          });
        });
      });

      describe("when failed load package", () => {
        it("should be return to Err", async () => {
          class DummyFileRepository implements FileRepository {
            constructor() {}
            async read(p: string) {
              return createErr({
                kind: "FailedOpenFile",
                path: p,
              } as const);
            }

            async write(
              _path: string,
              _body: string,
            ): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).err).toStrictEqual({
            kind: "ModuleIsNotFound",
            name: "foo",
          });
        });
      });
    });
  });
});
