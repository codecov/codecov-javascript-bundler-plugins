// eslint-disable-next-line @typescript-eslint/no-var-requires
const packageJson = require("./package.json") as { version: string };

const config = {
  testEnvironment: "node",
  collectCoverageFrom: ["!**/node_modules/**"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: {
          transform: {
            optimizer: {
              globals: {
                vars: {
                  __PACKAGE_VERSION__: packageJson.version,
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
