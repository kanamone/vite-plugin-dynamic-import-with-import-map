import { readFile, writeFile } from "fs/promises";
import { join } from "path";
import { FileRepository } from "./file-repository.js";
import { createErr, createOk } from "option-t/PlainResult";

type WriteInstruction = [string, string]
export class FsFileRepository implements FileRepository {
  constructor(private instructions: Array<WriteInstruction> = []) {}

  async read(path: string) {
    try {
      return createOk(await readFile(path, { encoding: "utf8" }));
    } catch {
      return createErr({ kind: "FailedOpenFile" as const, path: path });
    }
  }

  async write(path: string, body: string) {
    try {
      this.instructions.push([path, body] as const)
      return createOk(null);
    } catch {
      return createErr({ kind: "FailedWriteFile" as const, path: path });
    }
  }

  public async persist(path: string) {
    for(const [fileName, body] of this.instructions) {
      await writeFile(join(path, fileName), body)
    }
  }
}
