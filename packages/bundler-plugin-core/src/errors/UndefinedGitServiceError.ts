export class UndefinedGitServiceError extends Error {
  constructor(msg: string, options?: ErrorOptions) {
    super(msg, options);
  }
}
