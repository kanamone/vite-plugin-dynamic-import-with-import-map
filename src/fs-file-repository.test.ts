import { rm } from "fs/promises";
import { describe, it, expect } from "vitest";
import { FsFileRepository } from "./fs-file-repository";

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
      const readResult = await repo.read("./dummy-file");
      await rm("./dummy-file");
      expect(writeResult.ok).toBe(true);
      expect(readResult.val).toBe("foo");
    });
  });
});
