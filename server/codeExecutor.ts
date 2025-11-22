

const JUDGE0_URL = process.env.JUDGE0_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_HOST = process.env.JUDGE0_HOST || 'judge0-ce.p.rapidapi.com';
const JUDGE0_KEY = process.env.JUDGE0_KEY || '';

export interface ExecuteRequest {
    language: string; // e.g., 'python', 'javascript', 'cpp', 'java'
    code: string;
    input?: string;
}

export interface ExecuteResponse {
    output: string;
    error?: string;
    executionTime?: number;
    memory?: number; // in KB
}

// Map language identifiers to Judge0 language IDs
const languageMap: Record<string, number> = {
    python: 71, // Python 3.8.1
    javascript: 63, // JavaScript (Node.js)
    cpp: 54, // C++ (GCC 9.2.0)
    java: 62, // Java (OpenJDK 13.0.1)
};

export async function executeCode(req: ExecuteRequest): Promise<ExecuteResponse> {
    const languageId = languageMap[req.language];
    if (!languageId) {
        return { output: '', error: `Unsupported language: ${req.language}` };
    }

    const payload = {
        source_code: req.code,
        language_id: languageId,
        stdin: req.input || '',
        // set a timeout of 5 seconds
        cpu_time_limit: 5,
        memory_limit: 256000,
    };

    const response = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=false&wait=true`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-rapidapi-host': JUDGE0_HOST,
            'x-rapidapi-key': JUDGE0_KEY,
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        return { output: '', error: `Judge0 request failed: ${response.status}` };
    }

    interface Judge0Response {
        stdout: string | null;
        stderr: string | null;
        compile_output: string | null;
        time: string | null;
        memory: number | null;
        status: {
            id: number;
            description: string;
        };
    }

    const data = (await response.json()) as Judge0Response;
    if (data.status && data.status.id >= 3 && data.status.id !== 3) {
        // status 3 = Accepted, others are errors
        return { output: '', error: data.status.description || 'Execution error' };
    }

    return {
        output: data.stdout || '',
        error: data.stderr || data.compile_output || undefined,
        executionTime: data.time ? Number(data.time) * 1000 : undefined, // Convert to ms if needed, usually Judge0 returns seconds
        memory: data.memory || undefined,
    };
}
