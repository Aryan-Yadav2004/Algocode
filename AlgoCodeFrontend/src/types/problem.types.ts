export type ProblemData = {
    _id: string;
    title: string;
    description: string;
    editorial?: string;
    difficulty: string;
    url?: string;
    codeStubs: [
        {
            language: string;
            startSnippet: string;
            endSnippet: string;
            userSnippet: string;
        }
    ];
}