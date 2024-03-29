import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { NodeModuleRepository } from "./node-module-repository.js";
import { FileRepository, WriteFileError } from "./file-repository.js";
import { Result, createErr, createOk } from "option-t/PlainResult";
import { mkdirSync, rmdirSync, writeFileSync } from "fs";

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

            async write(): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("vite")).val).toMatchInlineSnapshot(`
            {
              "entryPointPath": "node_modules/.pnpm/vite@5.1.5_@types+node@20.11.25/node_modules/vite/foo.js",
              "name": "vite",
            }
          `);
        });
      });

      describe("when hoisting occurs", () => {
        it("should be return to Ok and module", async () => {
          beforeAll(() => {
            mkdirSync("../node_modules/foo", { recursive: true });
            writeFileSync(
              "../node_modules/foo/package.json",
              JSON.stringify({
                name: "foo",
                version: "0.0.4",
                description: "Import some module via importmap",
                repository: {
                  type: "git",
                  url: "https://github.com/kanamone/vite-plugin-dynamic-import-with-import-map",
                },
                main: "index.js",
                scripts: {
                  build: "tsup src/index.ts",
                  compile: "tsc --noEmit",
                  test: "vitest run",
                  "test:watch": "vitest",
                  format: "prettier --write src/*",
                  lint: "eslint src/*",
                  release: "changeset publish",
                },
                private: false,
                publishConfig: {
                  access: "public",
                  registry: "https://registry.npmjs.org/",
                },
                keywords: ["vite"],
                author: "himanoa <matsunoappy@gmail.com>",
                license: "MIT",
                devDependencies: {
                  "@changesets/cli": "2.27.1",
                  "@types/node": "20.11.25",
                  "@typescript-eslint/eslint-plugin": "7.2.0",
                  "@typescript-eslint/parser": "7.2.0",
                  "@vitest/coverage-v8": "1.3.1",
                  changeset: "0.2.6",
                  eslint: "8.57.0",
                  prettier: "3.2.5",
                  publint: "0.2.7",
                  tsup: "8.0.2",
                  typescript: "5.4.2",
                  "typescript-eslint": "7.2.0",
                  vitest: "1.3.1",
                },
                files: ["dist/*", "README.md"],
                dependencies: {
                  esbuild: "0.20.1",
                  "option-t": "39.0.2",
                  vite: "5.1.5",
                },
              }),
            );
            writeFileSync("../node_modules/foo/index.js", "");
          });

          afterAll(() => {
            try {
              rmdirSync("../node_modules/foo", { recursive: true });
            } catch (e) {
              // be something
            }
          });

          const readPackage = vi.fn((path: string) => {
            console.log(path);
            return createOk(
              JSON.stringify({
                name: "foo",
                type: "module",
                module: "./foo.js",
                main: "./main.js",
              }),
            );
          });
          class DummyFileRepository implements FileRepository {
            constructor() {}
            async read(path: string) {
              return readPackage(path);
            }

            async write(): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).val).toStrictEqual({
            name: "foo",
            entryPointPath: "foo.js",
          });

          expect(readPackage.mock.lastCall).toStrictEqual(["package.json"]);
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

            async write(): Promise<Result<null, WriteFileError>> {
              throw new Error("unreachable");
            }
          }

          const repo = new NodeModuleRepository(new DummyFileRepository());
          expect((await repo.resolve("foo")).val).toStrictEqual({
            name: "foo",
            entryPointPath: "main.js",
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

            async write(): Promise<Result<null, WriteFileError>> {
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

            async write(): Promise<Result<null, WriteFileError>> {
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
