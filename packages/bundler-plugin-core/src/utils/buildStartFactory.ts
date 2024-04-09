import { type Output } from "../types";

export const buildStartFactory = (output: Output) => {
  output.builtAt = Date.now();
};
