import Chalk from "chalk";

export function prepareMessage(msg: unknown): string {
  if (typeof msg === "string") {
    return msg;
  }
  if (msg instanceof Error) {
    return `${msg.stack ?? ""}`;
  }
  return JSON.stringify(msg, null, "\t");
}

export function l(msg: string): void {
  // Required to properly log to the console
  // eslint-disable-next-line no-console
  console.log(`[codecov] ${msg}`);
}

export function nl(): void {
  return l("");
}

export function green(msg: string): void {
  return l(Chalk.green(prepareMessage(msg)));
}

export function red(msg: string): void {
  return l(Chalk.red(prepareMessage(msg)));
}

export function dim(msg: string): void {
  return l(Chalk.dim(prepareMessage(msg)));
}

export function yellow(msg: string): void {
  return l(Chalk.yellow(prepareMessage(msg)));
}

export function cyan(msg: string): void {
  return l(Chalk.cyan(prepareMessage(msg)));
}

interface DebugOptions {
  enabled?: boolean;
}

export function debug(
  // Disable eslint because we want to allow any type of message when debugging
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  msg: any,
  { enabled = true }: DebugOptions = { enabled: true },
): void {
  if (enabled) {
    return l(Chalk.italic.yellow(prepareMessage(msg)));
  }
}
