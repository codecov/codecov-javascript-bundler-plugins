import { type Output } from "../types";

interface BuildStartHelperArgs {
  pluginName: string;
  pluginVersion: string;
  output: Output;
}

export const buildStartHelper = ({
  pluginName,
  pluginVersion,
  output,
}: BuildStartHelperArgs) => {
  output.builtAt = Date.now();
  output.plugin = {
    name: pluginName,
    version: pluginVersion,
  };
};
