import { Contest } from "../models/Contest.js";
import { Problem } from "../models/Problem.js";

const TAGS = [
  "Arrays",
  "Dynamic Programming",
  "Graph",
  "Trees",
  "Strings",
  "Math",
  "Sorting",
  "Binary Search",
  "Recursion",
  "Greedy",
  "Stack",
  "Queue",
];

const COMPANIES = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Netflix"];

function pick(arr, index) {
  return arr[index % arr.length];
}

function starterCodeFor(index) {
  return {
    javascript:
      "/**\n * Solve the problem below.\n */\nfunction solve(input) {\n  // TODO\n  return input;\n}\n",
    python: "def solve(input_data):\n    # TODO\n    return input_data\n",
    cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nint main(){\n  // TODO\n  return 0;\n}\n",
    java: "class Main {\n  public static void main(String[] args) {\n    // TODO\n  }\n}\n",
  };
}

function buildProblem(i) {
  const difficulty = i <= 20 ? "Easy" : i <= 40 ? "Medium" : "Hard";
  const tagA = pick(TAGS, i);
  const tagB = pick(TAGS, i + 3);
  const company = pick(COMPANIES, i + 1);

  return {
    title: `Quest Challenge ${i}`,
    slug: `quest-challenge-${i}`,
    difficulty,
    tags: [tagA, tagB],
    companies: [company],
    acceptanceRate: Math.max(22, 82 - i),
    description:
      `You are given an input set for Quest Challenge ${i}. Compute the required output following the constraints.\n` +
      `Focus on correctness first, then optimize for time complexity.`,
    examples: [
      {
        input: "n = 5",
        output: "8",
        explanation: "Sample output for demonstration.",
      },
    ],
    constraints: [
      "1 <= n <= 10^5",
      "Time complexity target: O(n log n) or better",
    ],
    hints: [
      "Try to identify reusable subproblems.",
      "Use hashing or sorting depending on the data shape.",
    ],
    editorial:
      "Start with a brute-force baseline, then reduce repeated work using an auxiliary data structure.",
    starterCode: starterCodeFor(i),
    testCases: [
      { input: "5", output: "8", hidden: false },
      { input: "10", output: "13", hidden: true },
    ],
  };
}

async function seedProblems(targetCount = 50) {
  const existingCount = await Problem.countDocuments();
  if (existingCount >= targetCount) return { inserted: 0 };

  const docs = [];
  for (let i = 1; i <= targetCount; i += 1) {
    docs.push(buildProblem(i));
  }

  const ops = docs.map((doc) => ({
    updateOne: {
      filter: { slug: doc.slug },
      update: { $setOnInsert: doc },
      upsert: true,
    },
  }));

  const result = await Problem.bulkWrite(ops, { ordered: false });
  const inserted = result.upsertedCount || 0;
  return { inserted };
}

async function seedContests() {
  const existing = await Contest.countDocuments();
  if (existing > 0) return { inserted: 0 };

  const problems = await Problem.find().sort({ createdAt: 1 }).limit(50);
  if (problems.length < 6) return { inserted: 0 };

  const now = Date.now();
  const liveProblemIds = problems.slice(0, 6).map((p) => p._id);
  const upcomingProblemIds = problems.slice(6, 12).map((p) => p._id);
  const pastProblemIds = problems.slice(12, 18).map((p) => p._id);

  const contests = [
    {
      title: "Questoria Weekly Sprint (Live)",
      description:
        "A live coding sprint with mixed-difficulty problems. Solve fast, score high.",
      startsAt: new Date(now - 60 * 60 * 1000),
      endsAt: new Date(now + 2 * 60 * 60 * 1000),
      problems: liveProblemIds,
      isPublished: true,
      participants: [],
    },
    {
      title: "Weekend Algorithm Arena",
      description:
        "Upcoming contest focused on arrays, graphs, and dynamic programming.",
      startsAt: new Date(now + 24 * 60 * 60 * 1000),
      endsAt: new Date(now + 27 * 60 * 60 * 1000),
      problems: upcomingProblemIds,
      isPublished: true,
      participants: [],
    },
    {
      title: "Neural Nexus Throwback",
      description: "Past contest archive for practice and benchmarking.",
      startsAt: new Date(now - 72 * 60 * 60 * 1000),
      endsAt: new Date(now - 69 * 60 * 60 * 1000),
      problems: pastProblemIds,
      isPublished: true,
      participants: [],
    },
  ];

  await Contest.insertMany(contests);
  return { inserted: contests.length };
}

export async function seedPlatformData() {
  const problems = await seedProblems(50);
  const contests = await seedContests();

  if (problems.inserted > 0) {
    // eslint-disable-next-line no-console
    console.log(`✅ Seeded ${problems.inserted} starter problems`);
  }
  if (contests.inserted > 0) {
    // eslint-disable-next-line no-console
    console.log(`✅ Seeded ${contests.inserted} starter contests`);
  }
}
