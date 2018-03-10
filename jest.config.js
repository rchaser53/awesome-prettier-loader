module.exports = {
  moduleFileExtensions: [
    'ts',
    'js',
  ],
  globals: {
    NODE_ENV: 'test',
  },
  transform: {
    '^.+\\.js$': 'babel-jest',
    '^.+\\.ts$': '<rootDir>/preprocessor.js'
  },
  testPathIgnorePatterns: [
    '<rootDir>/node_modules/'
  ],
  testMatch: [
    '**/src/**/__tests__/*.(ts|js)',
  ],
};