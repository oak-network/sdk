/** @type {import("eslint").Linter.Config} */
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project: ["./packages/api/tsconfig.build.json"],
    tsconfigRootDir: __dirname,
    sourceType: "module",
  },
  env: {
    node: true,
    es2022: true,
  },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier",
  ],
  ignorePatterns: [
    "dist/",
    "coverage/",
    "node_modules/",
    "packages/**/dist/",
    "packages/**/coverage/",
  ],
};

