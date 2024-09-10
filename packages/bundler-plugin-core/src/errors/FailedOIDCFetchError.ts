export class FailedOIDCFetchError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
