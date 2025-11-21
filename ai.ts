// Use global fetch available in Node 18+ runtime

interface GenerateOptions {
   userProfile?: string;
   jobDescription: string;
   tone?: string;
}

export async function generateMessage(options: GenerateOptions): Promise<string> {
   const { userProfile, jobDescription, tone } = options;

   const apiKey = process.env.OPENAI_API_KEY;
   const prompt = `You are an assistant that writes concise, professional recruiter messages.\n\nUser profile:\n${userProfile || "<no profile provided>"}\n\nJob description:\n${jobDescription}\n\nWrite a short (3-6 sentences) message from the candidate to the recruiter. Tone: ${tone || "professional and friendly"}. Include a one-line closing that offers availability for an interview.`;

   if (!apiKey) {
      // Fallback simple template when no API key is configured.
      return `Hi, I\'m interested in this role. ${tone || "I\'m excited about the opportunity"}. I have relevant experience and would love to discuss. I'm available for interviews on weekdays after 10am.`;
   }

   // Use OpenAI Chat Completions via REST. Node 18+ has global fetch but use node-fetch compatibility.
   const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
         "Content-Type": "application/json",
         Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
         model: "gpt-4o-mini",
         messages: [
            { role: "system", content: "You are a helpful assistant that writes short recruiter messages." },
            { role: "user", content: prompt },
         ],
         max_tokens: 300,
         temperature: 0.2,
      }),
   });

   if (!res.ok) {
      const text = await res.text();
      throw new Error(`LLM error: ${res.status} ${text}`);
   }

   const body = await res.json();
   const message = body?.choices?.[0]?.message?.content;
   return message || "";
}

export async function mockGenerate(jobDescription: string) {
   return `Hi — I saw your posting and I'm very interested. I have experience that matches the role and would love to talk more. I'm available most weekdays in the afternoon.`;
}

export default { generateMessage, mockGenerate };
