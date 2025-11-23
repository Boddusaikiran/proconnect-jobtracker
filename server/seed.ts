import { storage } from "./storage";
import { problems } from "./data/problems_data";

export async function seedData() {
  console.log("[Seed] Starting to seed coding problems...");

  try {
    // Seed all problems from problems_data.ts
    for (const problemData of problems) {
      // Create the problem (storage will generate the ID)
      const createdProblem = await storage.createCodingProblem(problemData as any);

      // Seed test cases for this problem using the generated ID
      if (problemData.testCases) {
        for (const testCase of problemData.testCases) {
          await storage.createCodingTestCase({
            problemId: createdProblem.id,
            input: testCase.input,
            output: testCase.output,
            isHidden: false
          });
        }
      }
    }

    console.log(`[Seed] Successfully seeded ${problems.length} coding problems`);
  } catch (error) {
    console.error("[Seed] Error seeding data:", error);
  }
}
