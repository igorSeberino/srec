module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  coverageReporters: ['text-summary', 'json-summary', 'lcov'],
  // Gate de cobertura (OPS-03, fase 1): trava o valor medido na entrega, sem exigir avanço.
  // Baseline do recebimento: 6,14 / 0 / 3,57 / 6,14. Suba estes números em PR próprio.
  coverageThreshold: { global: { statements: 49, branches: 70, functions: 33, lines: 50 } },
  projects: [
    { displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/src/**/*.test.js'] },
    { displayName: 'integration', testEnvironment: 'node', testMatch: ['<rootDir>/tests/integration/**/*.test.js'], setupFiles: ['<rootDir>/tests/setupEnv.js'], maxWorkers: 1 },
  ],
};
