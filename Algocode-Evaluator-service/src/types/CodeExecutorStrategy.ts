export type TestCase = {
    input: string;
    output: string;
};

export type TestCaseResult = {
    testCaseIndex: number;
    status: 'SUCCESS' | 'WA' | 'TLE' | 'MLE' | 'RE';
    output: string;
    expected: string;
};

export type ExecutionResponse = {
    status: 'SUCCESS' | 'WA' | 'TLE' | 'MLE' | 'RE';
    failedTestCase?: TestCaseResult;
    output?: string;
    expected?: string;
    userId: string;
    submissionId: string;
};

/**
 * Strategy interface for language-specific code executors.
 *
 * Each implementation is responsible for:
 *  1. Spinning up exactly ONE Docker container for the full submission
 *  2. Compiling the code (if applicable) once inside that container
 *  3. Running the binary/script against each test case via exec()
 *  4. Tearing down the container in a finally block
 */
export default interface CodeExecutorStrategy {
    execute(
        code: string,
        testCases: TestCase[],
        userId: string,
        submissionId: string,
    ): Promise<ExecutionResponse>;
}