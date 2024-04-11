import { type Output } from "../types";

export const buildStartHelper = (output: Output) => {
  output.builtAt = Date.now();
};
