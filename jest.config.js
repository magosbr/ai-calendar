module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },
    testRegex: '(/__tests__/.*|(\\.|/)(test|spec))\\.ts?$',
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleNameMapper: {
        '^@tools/(.*)$': '<rootDir>/src/ai/tools/$1',
        '^@models/(.*)$': '<rootDir>/src/core/models/$1',
        '^@implementations/(.*)$': '<rootDir>/src/core/implementations/$1',
        '^@agents/(.*)$': '<rootDir>/src/ai/agents/$1',
        '^@repositories/(.*)$': '<rootDir>/src/core/repositories/$1',
    }
};