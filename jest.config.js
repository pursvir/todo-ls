module.exports = {
  preset: "ts-jest",
  transform: {
    "^.+\\.ts?$": [
      "ts-jest",
      {
        tsconfig: "tsconfig.tests.json",
      },
    ],
  },
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  collectCoverageFrom: ["src/**/*.{ts,js}", "!src/**/*.d.ts"],
};
