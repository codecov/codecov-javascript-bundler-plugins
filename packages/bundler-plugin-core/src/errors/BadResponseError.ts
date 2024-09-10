export class BadResponseError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
