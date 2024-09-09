export class FailedUploadError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
