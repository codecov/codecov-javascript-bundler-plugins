export class FailedUploadError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
