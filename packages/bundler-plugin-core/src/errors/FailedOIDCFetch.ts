export class FailedOIDCFetch extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
