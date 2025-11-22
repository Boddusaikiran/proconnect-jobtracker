export interface Problem {
    id: number;
    title: string;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    starterCode: {
        python: string;
        javascript: string;
        cpp: string;
        java: string;
    };
    testCases: { input: string; output: string }[];
}
