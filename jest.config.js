/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: 'ts-jest',
  testEnvironment: 'node',
  transform: { '^.+\\.(j|t)s(x)?$': 'esbuild-jest' },
  moduleFileExtensions: ['js'],
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
