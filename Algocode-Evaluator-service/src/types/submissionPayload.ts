
type testCase = {
    input: string,
    output: string
}

export type submissionPayload = {
    userId: string,
    code: string,
    language: string,
    testCases: testCase[],
}