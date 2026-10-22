module.exports = {
  collectCoverageFrom: ['src/**/*.js'],
  projects: [
    { displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/src/**/*.test.js'] },
    { displayName: 'integration', testEnvironment: 'node', testMatch: ['<rootDir>/tests/integration/**/*.test.js'], setupFiles: ['<rootDir>/tests/setupEnv.js'], maxWorkers: 1 },
  ],
};
