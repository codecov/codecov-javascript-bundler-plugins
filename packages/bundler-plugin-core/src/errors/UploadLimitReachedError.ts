export class UploadLimitReachedError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
