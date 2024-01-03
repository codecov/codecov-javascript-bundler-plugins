module.exports = {
  testEnvironment: "node",
  transform: {
    "^.+\\.(t|j)sx?$": ["@swc/jest"],
    "^.+\\.m(t|j)sx?$": ["@swc/jest"],
  },
};
