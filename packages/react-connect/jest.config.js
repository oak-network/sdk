module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  testMatch: ["**/__tests__/**/*.test.{ts,tsx}"],
  collectCoverageFrom: [
    "src/**/*.{ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/index.ts",
  ],
  coverageThreshold: {
    global: {
      branches: 65,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
  coverageReporters: ["text", "text-summary", "lcov", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^@test-mocks/(.*)$": "<rootDir>/__tests__/mocks/$1",
    "^react-plaid-link$": "<rootDir>/__tests__/mocks/react-plaid-link.ts",
    "^@stripe/connect-js$": "<rootDir>/__tests__/mocks/@stripe/connect-js.ts",
    "^@stripe/react-connect-js$":
      "<rootDir>/__tests__/mocks/@stripe/react-connect-js.ts",
  },
};
