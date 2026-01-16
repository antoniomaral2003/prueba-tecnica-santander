module.exports = {
    moduleFileExtensions: ['js', 'json', 'ts'],
    rootDir: '.',
    testRegex: '.*\\.spec\\.ts$',
    transform: {
        '^.+\\.(t|j)s$': 'ts-jest',
    },
    collectCoverageFrom: [
        'src/**/*.ts',
        '!src/main.ts',
        '!src/**/*.module.ts',
        '!src/**/*.entity.ts',
        '!src/**/dto/*.ts',
    ],
    coverageDirectory: './coverage',
    testEnvironment: 'node',
    moduleNameMapper: {
        '^src/(.*)$': '<rootDir>/src/$1',
    },
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70,
        },
    },
};