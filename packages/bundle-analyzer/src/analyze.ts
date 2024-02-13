import { readFileSync } from "node:fs";

import { type RollupOptions, rollup } from "rollup";
import resolve from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";

import { codecovRollupPlugin } from "@codecov/rollup-plugin";

import { type Exports, type PackageJson } from "./types";

export async function analyze(): Promise<void> {
  const packageJson = JSON.parse(
    readFileSync("package.json", "utf-8"),
  ) as PackageJson;

  const { main, module, exports } = packageJson;

  const input = new Set<string>();

  if (main) {
    input.add(removeRelative(main));
  }

  if (module) {
    input.add(removeRelative(module));
  }

  addExports(input, exports);

  if (input.size === 0) {
    return;
  }

  const options: RollupOptions = {
    input: Array.from(input).reduce(
      (acc, cur) => {
        acc[cur.slice(0, -3)] = cur;
        return acc;
      },
      {} as Record<string, string>,
    ),
    output: {
      preserveModules: true,
      format: "cjs",
    },
    plugins: [
      commonjs({
        requireReturnsDefault: "namespace",
        defaultIsModuleExports: false,
      }),
      resolve(),
      codecovRollupPlugin({
        dryRun: true,
        enableBundleAnalysis: true,
        bundleName: "example-rollup-bundle",
        uploadToken: process.env.CODECOV_TOKEN,
      }),
    ],
  };

  const bundle = await rollup(options);
  // const { output } = await bundle.generate({});
  // @ts-expe ct-error - output is an array of OutputChunk
  // eslint-disable-next-line no-console
  // console.log(output[output.length - 1].source);
  await bundle.write({
    dir: "kappa",
  });
  await bundle.close();
}

function addExports(input: Set<string>, packageJsonExports?: Exports): void {
  if (!packageJsonExports) {
    return;
  }

  if (
    typeof packageJsonExports === "string" ||
    Array.isArray(packageJsonExports)
  ) {
    addToInput(input, packageJsonExports);
  } else {
    for (const exportItem of Object.values(packageJsonExports)) {
      if (exportItem) {
        if (typeof exportItem === "string" || Array.isArray(exportItem)) {
          addToInput(input, exportItem);
        } else {
          const {
            require: requireField,
            import: importField,
            node: nodeField,
            default: defaultField,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            types,
            ...rest
          } = exportItem;

          addToInput(input, requireField);
          addToInput(input, importField);
          addToInput(input, nodeField);
          addToInput(input, defaultField);

          if (Object.keys(rest).length > 0) {
            addExports(input, rest);
          }
        }
      }
    }
  }
}

function addToInput(
  input: Set<string>,
  value: string | string[] | undefined,
): void {
  if (!value) {
    return;
  }

  if (Array.isArray(value)) {
    for (const v of value) {
      if (isJsFile(v)) {
        input.add(removeRelative(v));
      }
    }
  } else {
    if (isJsFile(value)) {
      input.add(removeRelative(value));
    }
  }
}

function isJsFile(input: string): boolean {
  return input.endsWith(".js");
}

function removeRelative(input: string): string {
  if (input.startsWith("./")) {
    return input.slice(2);
  }
  return input;
}
