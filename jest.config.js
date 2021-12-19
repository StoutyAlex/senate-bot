module.exports = {
    roots: ['<rootDir>/test'],
    testMatch: ['**/*.test.ts'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest',
    },
    collectCoverageFrom: ['<rootDir>/src/**/*', '<rootDir>/cdk/**/*'],
    coveragePathIgnorePatterns: [
      '<rootDir>/src/stubs',
      '<rootDir>/src/shims',
      '<rootDir>/src/types',
      '<rootDir>/src/configuration/secrets.ts',
      '<rootDir>/src/lib/lambda-logging-fix.js',
    ],
    testEnvironment: 'node',
    globals: {
      'ts-jest': {
        isolatedModules: true,
      },
    },
  }