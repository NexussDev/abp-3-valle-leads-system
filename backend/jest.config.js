/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleFileExtensions: ['ts', 'js'],
  // dist/ contém .d.ts duplicado que ts-jest pickup em runs após `npm run build`
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        isolatedModules: true,
        tsconfig: {
          types: ['jest', 'node'],
          skipLibCheck: true,
          esModuleInterop: true,
          moduleResolution: 'node',
          target: 'ES2020',
          module: 'commonjs',
          ignoreDeprecations: '6.0',
        },
      },
    ],
  },
};
