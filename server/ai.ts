import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateMessage({ userProfile, jobDescription, tone }: { userProfile?: string, jobDescription: string, tone?: string }) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are a professional career assistant helping a candidate write a message to a recruiter. Keep it concise and professional."
                },
                {
                    role: "user",
                    content: `
            User Profile: ${userProfile || "Not provided"}
            Job Description: ${jobDescription}
            Tone: ${tone || "Professional"}
            
            Draft a short message to the recruiter/hiring manager.
          `
                }
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        throw new Error("Failed to generate message: " + (error as Error).message);
    }
}

export async function analyzeResume(resumeText: string, jobDescription?: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert ATS (Applicant Tracking System) analyzer. Analyze the resume against the job description (if provided) or give general feedback."
                },
                {
                    role: "user",
                    content: `
            Resume Text: ${resumeText}
            Job Description: ${jobDescription || "General Analysis"}
            
            Provide a JSON response with:
            1. score (0-100)
            2. missingKeywords (array of strings)
            3. suggestions (array of strings)
            4. summary (string)
          `
                }
            ],
            response_format: { type: "json_object" }
        });

        return JSON.parse(response.choices[0].message.content || "{}");
    } catch (error) {
        throw new Error("Failed to analyze resume: " + (error as Error).message);
    }
}

export async function chatWithAI(message: string, context?: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are JobButler, a helpful AI career assistant. You help users with job search, interview prep, and career advice."
                },
                {
                    role: "user",
                    content: `Context: ${context || "None"}\n\nUser: ${message}`
                }
            ],
        });

        return response.choices[0].message.content;
    } catch (error) {
        throw new Error("AI chat failed: " + (error as Error).message);
    }
}
