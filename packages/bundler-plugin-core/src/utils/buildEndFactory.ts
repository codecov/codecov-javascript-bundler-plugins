import { type Output } from "../types";

export const buildEndFactory = (output: Output) => {
  output.duration = Date.now() - (output.builtAt ?? 0);
};
