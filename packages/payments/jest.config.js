module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  // Override the preset transform so ts-jest uses tsconfig.test.json,
  // which adds "jest" to the types array (the base tsconfig only has "node").
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      { tsconfig: "tsconfig.test.json" },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.ts"],
  setupFiles: ["<rootDir>/__tests__/setup.ts"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90,
    },
  },
  coverageReporters: ["text", "text-summary", "lcov", "json"],
};
