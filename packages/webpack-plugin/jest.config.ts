import { type Config } from "jest";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json") as {
  version: string;
  name: string;
};

const config: Config = {
  testEnvironment: "node",
  collectCoverageFrom: [
    "src/**/*.ts",
    "src/**/*.tsx",
    "!**/node_modules/**",
    "!test/helpers.ts",
  ],
  moduleNameMapper: {
    "^@test-utils/(.*)$": "<rootDir>/test-utils/$1",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            optimizer: {
              globals: {
                vars: {
                  __PACKAGE_VERSION__: JSON.stringify(packageJson.version),
                  __PACKAGE_NAME__: JSON.stringify(packageJson.name),
                },
              },
            },
          },
        },
      },
    ],
  },
};

export default config;
