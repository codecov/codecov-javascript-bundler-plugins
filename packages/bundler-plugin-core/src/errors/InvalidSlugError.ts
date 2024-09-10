export class InvalidSlugError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
