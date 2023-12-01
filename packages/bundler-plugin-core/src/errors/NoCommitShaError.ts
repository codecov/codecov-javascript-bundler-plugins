export class NoCommitShaError extends Error {
  constructor(msg: string) {
    super(msg);
  }
}
