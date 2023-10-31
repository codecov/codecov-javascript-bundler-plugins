import { createUnplugin } from "unplugin";

export const unplugin = createUnplugin((_options) => {
  return {
    name: "unplugin-stats",
  };
});
