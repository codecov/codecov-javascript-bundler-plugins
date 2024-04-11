import { type Output } from "../types";

export const buildEndHelper = (output: Output) => {
  output.duration = Date.now() - (output.builtAt ?? 0);
};
