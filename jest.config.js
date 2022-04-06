const babelConfig = require('./babel.config.json');

require('babel-register')(babelConfig);
require('@babel/polyfill');

const common = {
  verbose: true,
  testPathIgnorePatterns: ['<rootDir>/node_modules/'],
  coveragePathIgnorePatterns: ['node_modules'],
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
  },
  moduleFileExtensions: ['js'],
};

module.exports = {
  projects: [
    {
      ...common,
      displayName: 'node',
      testEnvironment: 'node',
      testRegex: '/src/.*\\.spec\\.js$',
    },
  ],
};
