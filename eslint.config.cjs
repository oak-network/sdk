// Flat ESLint config for ESLint v9+
const eslintJs = require("@eslint/js");
const tseslint = require("@typescript-eslint/eslint-plugin");
const tsParser = require("@typescript-eslint/parser");
const eslintConfigPrettier = require("eslint-config-prettier");
const globals = require("globals");

/** @type {import("eslint").Linter.FlatConfig[]} */
module.exports = [
  {
    ignores: [
      "dist/**",
      "coverage/**",
      "node_modules/**",
      "packages/**/dist/**",
      "packages/**/coverage/**",
    ],
  },
  {
    files: ["packages/api/src/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        RequestInit: "readonly",
        Response: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
      "@typescript-eslint/no-namespace": "off",
    },
  },
  {
    files: ["packages/api/__tests__/**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        tsconfigRootDir: __dirname,
        sourceType: "module",
      },
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.node,
        ...globals.jest,
      },
    },
    plugins: {
      "@typescript-eslint": tseslint,
    },
    rules: {
      ...eslintJs.configs.recommended.rules,
      ...tseslint.configs.recommended.rules,
      ...eslintConfigPrettier.rules,
    },
  },
];

