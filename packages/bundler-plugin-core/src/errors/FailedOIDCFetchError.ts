export class FailedOIDCFetchError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
