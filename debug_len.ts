import { problems } from "./server/data/problems_data";

console.log(JSON.stringify({ count: problems.length, slugs: problems.slice(0, 5).map(p => p.slug) }));
