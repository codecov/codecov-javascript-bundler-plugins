export class BadResponseError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
