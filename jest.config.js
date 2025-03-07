/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  moduleFileExtensions: ['js', 'ts'],
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/(?!src/)',
  ],
  transform: { '^.+\\.(j|t)s(x)?$': 'esbuild-jest' },
  transformIgnorePatterns: ['<rootDir>/node_modules/'],
};
