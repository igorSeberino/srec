module.exports = {
  // Arquivo de teste não entra no denominador; index.js é bootstrap puro
  // (listen + sinais) e não é alcançável por requisição.
  collectCoverageFrom: ['src/**/*.js', '!src/**/*.test.js', '!src/index.js'],
  projects: [
    { displayName: 'unit', testEnvironment: 'node', testMatch: ['<rootDir>/src/**/*.test.js'] },
    {
      displayName: 'integration',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/integration/**/*.test.js'],
      setupFiles: ['<rootDir>/tests/setupEnv.js'],
      globalSetup: '<rootDir>/tests/globalSetup.js',
      globalTeardown: '<rootDir>/tests/globalTeardown.js',
    },
  ],
};
