export class FailedFetchError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
