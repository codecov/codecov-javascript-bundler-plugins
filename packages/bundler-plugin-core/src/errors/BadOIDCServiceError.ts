export class BadOIDCServiceError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
