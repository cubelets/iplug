const common = {
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
};

export default {
  projects: [
    {
      ...common,
      displayName: 'node',
      testEnvironment: 'node',
      testRegex: '/src/.*\\.spec\\.js$',
    },
  ],
};
