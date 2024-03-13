import { Result } from "option-t/PlainResult";

export type ReadFileError = { kind: "FailedOpenFile"; path: string };
export type WriteFileError = { kind: "FailedWriteFile"; path: string };

export interface FileRepository {
  read(path: string): Promise<Result<string, ReadFileError>>;
  write(path: string, body: string): Promise<Result<null, WriteFileError>>;
}
