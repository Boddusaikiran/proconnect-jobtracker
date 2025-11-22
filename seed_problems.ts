import { storage } from "./server/storage";

async function seed() {
    console.log("Seeding coding problems...");

    const problems = [
        {
            title: "Two Sum",
            slug: "two-sum",
            description: "<p>Given an array of integers <code>nums</code> and an integer <code>target</code>, return <em>indices of the two numbers such that they add up to <code>target</code></em>.</p><p>You may assume that each input would have <strong>exactly one solution</strong>, and you may not use the <em>same</em> element twice.</p><p>You can return the answer in any order.</p>",
            difficulty: "easy",
            category: "Arrays",
            companyTags: ["Google", "Amazon", "Meta"],
            constraints: "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9",
            timeComplexity: "O(n)",
            spaceComplexity: "O(n)",
            starterCode: JSON.stringify({
                javascript: "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n    \n};",
                python: "class Solution:\n    def twoSum(self, nums: List[int], target: int) -> List[int]:\n        pass"
            }),
            testCases: [
                { input: "nums = [2,7,11,15], target = 9", output: "[0,1]" },
                { input: "nums = [3,2,4], target = 6", output: "[1,2]" },
                { input: "nums = [3,3], target = 6", output: "[0,1]" }
            ]
        },
        {
            title: "Reverse Linked List",
            slug: "reverse-linked-list",
            description: "<p>Given the <code>head</code> of a singly linked list, reverse the list, and return <em>the reversed list</em>.</p>",
            difficulty: "easy",
            category: "Linked Lists",
            companyTags: ["Amazon", "Microsoft"],
            constraints: "The number of nodes in the list is the range [0, 5000].\n-5000 <= Node.val <= 5000",
            timeComplexity: "O(n)",
            spaceComplexity: "O(1)",
            starterCode: JSON.stringify({
                javascript: "/**\n * Definition for singly-linked list.\n * function ListNode(val, next) {\n *     this.val = (val===undefined ? 0 : val)\n *     this.next = (next===undefined ? null : next)\n * }\n */\n/**\n * @param {ListNode} head\n * @return {ListNode}\n */\nvar reverseList = function(head) {\n    \n};",
                python: "# Definition for singly-linked list.\n# class ListNode:\n#     def __init__(self, val=0, next=None):\n#         self.val = val\n#         self.next = next\nclass Solution:\n    def reverseList(self, head: Optional[ListNode]) -> Optional[ListNode]:\n        pass"
            }),
            testCases: [
                { input: "head = [1,2,3,4,5]", output: "[5,4,3,2,1]" },
                { input: "head = [1,2]", output: "[2,1]" },
                { input: "head = []", output: "[]" }
            ]
        },
        {
            title: "Longest Substring Without Repeating Characters",
            slug: "longest-substring-without-repeating-characters",
            description: "<p>Given a string <code>s</code>, find the length of the <strong>longest substring</strong> without repeating characters.</p>",
            difficulty: "medium",
            category: "Strings",
            companyTags: ["Google", "Meta", "Amazon", "Microsoft"],
            constraints: "0 <= s.length <= 5 * 10^4\ns consists of English letters, digits, symbols and spaces.",
            timeComplexity: "O(n)",
            spaceComplexity: "O(min(m, n))",
            starterCode: JSON.stringify({
                javascript: "/**\n * @param {string} s\n * @return {number}\n */\nvar lengthOfLongestSubstring = function(s) {\n    \n};",
                python: "class Solution:\n    def lengthOfLongestSubstring(self, s: str) -> int:\n        pass"
            }),
            testCases: [
                { input: "s = \"abcabcbb\"", output: "3" },
                { input: "s = \"bbbbb\"", output: "1" },
                { input: "s = \"pwwkew\"", output: "3" }
            ]
        }
    ];

    for (const p of problems) {
        const existing = await storage.getCodingProblemBySlug(p.slug);
        let problemId;

        if (!existing) {
            // Extract testCases before creating problem as it's not part of InsertCodingProblem
            const { testCases, ...problemData } = p;
            const created = await storage.createCodingProblem(problemData);
            problemId = created.id;
            console.log(`Created problem: ${p.title}`);

            // Create test cases
            if (testCases) {
                for (const tc of testCases) {
                    await storage.createCodingTestCase({
                        problemId,
                        input: tc.input,
                        output: tc.output,
                        isHidden: false
                    });
                }
                console.log(`Created ${testCases.length} test cases for ${p.title}`);
            }
        } else {
            console.log(`Problem already exists: ${p.title}`);
            // Optionally update test cases here if needed, but skipping for now to avoid duplicates
        }
    }

    console.log("Seeding complete!");
}

seed().catch(console.error);
