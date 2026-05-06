export class AuthenticationError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
