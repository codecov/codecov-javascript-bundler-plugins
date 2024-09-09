export class NoUploadTokenError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
