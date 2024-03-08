import { readFile, writeFile } from "fs/promises";
import { FileRepository } from "./file-repository";
import { createErr, createOk } from "option-t/PlainResult";

export class FsFileRepository implements FileRepository {
  constructor() {}

  async read(path: string) {
    try {
      return createOk(await readFile(path, { encoding: "utf8" }));
    } catch {
      return createErr({ kind: "FailedOpenFile" as const, path: path });
    }
  }

  async write(path: string, body: string) {
    try {
      return createOk(await writeFile(path, body));
    } catch {
      return createErr({ kind: "FailedWriteFile" as const, path: path });
    }
  }
}