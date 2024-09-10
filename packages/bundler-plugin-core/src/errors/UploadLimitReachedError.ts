export class UploadLimitReachedError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
