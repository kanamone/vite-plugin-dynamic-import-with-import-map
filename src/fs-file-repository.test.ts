import { describe, it, expect } from "vitest";
import { FsFileRepository } from "./fs-file-repository.js";
import { rmSync } from "fs";

describe("FsFileRepository", () => {
  describe("#read", () => {
    it("should be return to Ok", async () => {
      const repo = new FsFileRepository();
      const result = await repo.read("./package.json");
      expect(result.ok).toBe(true);
    });

    it("should be return to Err", async () => {
      const repo = new FsFileRepository();
      const result = await repo.read("./fooo");
      expect(result.err?.kind).toBe("FailedOpenFile");
    });
  });

  describe("write", () => {
    it("should be return to Ok and exist file", async () => {
      const repo = new FsFileRepository();
      const writeResult = await repo.write("./dummy-file", "foo");
      expect(writeResult.ok).toBe(true);
    });
  });

  describe("persist", () => {
    it("should be file exist", async () => {
      const repo = new FsFileRepository();
      await repo.write("./dummy-file", "foo");
      await repo.persist(".");
      const readResult = await repo.read("./dummy-file");
      rmSync("dummy-file");
      expect(readResult.ok).toBe(true);
    });
  });
});
