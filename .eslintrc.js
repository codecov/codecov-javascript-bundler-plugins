/** @type {import("eslint").Linter.Config} */
const config = {
  root: true,
  parser: "@typescript-eslint/parser",
  plugins: ["isaacscript", "import"],
  extends: [
    "plugin:@typescript-eslint/recommended-type-checked",
    "plugin:@typescript-eslint/stylistic-type-checked",
    "plugin:prettier/recommended",
  ],
  ignorePatterns: [
    "**/bundlers/**",
    "**/coverage/**",
    "**/dist/**",
    "**/node_modules/**",
  ],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    tsconfigRootDir: __dirname,
    project: [
      "./tsconfig.json",
      "./packages/bundler-plugin-core/tsconfig.json",
      "./packages/rollup-plugin/tsconfig.json",
      "./packages/vite-plugin/tsconfig.json",
      "./packages/webpack-plugin/tsconfig.json",
    ],
  },
  rules: {
    "@typescript-eslint/no-unused-vars": [
      "error",
      { argsIgnorePattern: "^_", destructuredArrayIgnorePattern: "^_" },
    ],
    "@typescript-eslint/consistent-type-imports": [
      "error",
      { prefer: "type-imports", fixStyle: "inline-type-imports" },
    ],
    "import/consistent-type-specifier-style": ["error", "prefer-inline"],
    "isaacscript/complete-sentences-jsdoc": "warn",
    "isaacscript/format-jsdoc-comments": "warn",
    "@typescript-eslint/no-confusing-void-expressions": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
  },
};

module.exports = config;
