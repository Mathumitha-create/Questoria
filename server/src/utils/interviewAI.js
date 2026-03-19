import axios from "axios";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

const FALLBACK_QUESTIONS = {
  dsa: {
    easy: [
      "Given an array of integers, return indices of two numbers that add up to a target.",
      "Explain the difference between array and linked list with one practical example.",
      "Write a function to check if a string is a palindrome.",
    ],
    medium: [
      "Design an algorithm to find the first non-repeating character in a string efficiently.",
      "Implement LRU cache and explain time complexity of operations.",
      "Solve: longest substring without repeating characters.",
    ],
    hard: [
      "Design a scalable autocomplete system with complexity trade-offs.",
      "Given a large graph, detect cycles and discuss memory-optimized approach.",
      "Solve: median of two sorted arrays in logarithmic time.",
    ],
  },
  hr: {
    easy: [
      "Tell me about yourself and your background.",
      "Why do you want to join our company?",
      "Describe a challenge you solved recently.",
    ],
    medium: [
      "Describe a conflict in your team and how you resolved it.",
      "Tell me about a time you received critical feedback.",
      "How do you prioritize tasks under pressure?",
    ],
    hard: [
      "How do you handle ambiguity when requirements keep changing?",
      "Describe a major failure and what changed in your approach after it.",
      "Pitch yourself for a senior role in under 2 minutes.",
    ],
  },
  "system-design": {
    easy: [
      "Design a URL shortener at a high level.",
      "Design a notification system for a coding platform.",
      "Design a basic leaderboard service.",
    ],
    medium: [
      "Design a real-time collaborative code editor.",
      "Design a scalable contest system for coding challenges.",
      "Design a chat service for mentor-student interactions.",
    ],
    hard: [
      "Design YouTube-like video platform focusing on scalability and CDN strategy.",
      "Design a globally distributed interview platform with low-latency collaboration.",
      "Design an event-driven architecture for large scale learning analytics.",
    ],
  },
};

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  );
}

function parseFirstJsonObject(rawText, fallback = {}) {
  try {
    const match = String(rawText || "").match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : "{}");
  } catch {
    return fallback;
  }
}

async function callGemini(prompt) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error("missing-api-key");
  }

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
    },
  );

  return response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

function buildFallbackQuestions(type, difficulty) {
  const raw =
    FALLBACK_QUESTIONS[type]?.[difficulty] || FALLBACK_QUESTIONS.dsa.easy;
  return raw.map((prompt, idx) => ({
    questionId: `${type}-${difficulty}-${idx + 1}`,
    prompt,
    type:
      type === "hr"
        ? "hr"
        : type === "system-design"
          ? "system-design"
          : "coding",
    expectedFocus:
      type === "hr"
        ? ["communication", "clarity", "confidence"]
        : type === "system-design"
          ? ["architecture", "scalability", "trade-offs"]
          : ["correctness", "complexity", "optimization"],
    starterCode:
      type === "dsa"
        ? "function solve(input) {\n  // write your solution\n}\n"
        : "",
  }));
}

export async function generateInterviewQuestions({
  type,
  difficulty,
  count = 3,
}) {
  const fallbackQuestions = buildFallbackQuestions(type, difficulty).slice(
    0,
    count,
  );

  try {
    const prompt = `You are a technical interviewer. Generate ${count} interview questions for type=${type} and difficulty=${difficulty}.\nReturn strict JSON with shape: {\"questions\":[{\"prompt\":string,\"type\":\"coding\"|\"hr\"|\"system-design\",\"expectedFocus\":string[],\"starterCode\":string}]}.\nNo markdown.`;

    const raw = await callGemini(prompt);
    const parsed = parseFirstJsonObject(raw, {});
    const q = Array.isArray(parsed?.questions) ? parsed.questions : [];

    if (!q.length) {
      return fallbackQuestions;
    }

    return q.slice(0, count).map((item, idx) => ({
      questionId: `${type}-${difficulty}-${idx + 1}`,
      prompt: String(
        item?.prompt ||
          fallbackQuestions[idx % fallbackQuestions.length].prompt,
      ),
      type:
        item?.type === "hr" ||
        item?.type === "system-design" ||
        item?.type === "coding"
          ? item.type
          : type === "hr"
            ? "hr"
            : type === "system-design"
              ? "system-design"
              : "coding",
      expectedFocus: Array.isArray(item?.expectedFocus)
        ? item.expectedFocus.slice(0, 6)
        : fallbackQuestions[idx % fallbackQuestions.length].expectedFocus,
      starterCode: String(item?.starterCode || ""),
    }));
  } catch {
    return fallbackQuestions;
  }
}

export async function evaluateInterviewAnswer({
  question,
  answerText,
  code,
  type,
  difficulty,
}) {
  const fallback = {
    score: Math.max(
      20,
      Math.min(
        95,
        Math.round(
          (String(answerText || code || "").trim().length / 30) * 10 + 30,
        ),
      ),
    ),
    feedback: {
      correctness:
        "Good attempt. Expand edge-case handling for stronger correctness.",
      clarity: "Your answer is understandable; use more structured steps.",
      optimization:
        type === "coding"
          ? "Discuss time and space complexity explicitly."
          : "N/A for this question type.",
      communication:
        type === "hr"
          ? "Use STAR format and include measurable outcomes."
          : "Keep trade-off explanation concise and clear.",
      overall:
        "Solid direction. Add specifics and measurable impact to improve score.",
      improvements: [
        "Explain assumptions before solution details",
        "Mention trade-offs and complexity",
        "Conclude with final summary",
      ],
    },
  };

  try {
    const prompt = `You are an interviewer evaluating an answer.\nQuestion: ${question}\nType: ${type}\nDifficulty: ${difficulty}\nAnswer Text: ${answerText || ""}\nCode: ${code || ""}\nReturn strict JSON: {\"score\": number(0-100), \"feedback\": {\"correctness\": string,\"clarity\": string,\"optimization\": string,\"communication\": string,\"overall\": string,\"improvements\": string[]}}`;

    const raw = await callGemini(prompt);
    const parsed = parseFirstJsonObject(raw, fallback);

    return {
      score: Number(parsed?.score || fallback.score),
      feedback: {
        correctness: String(
          parsed?.feedback?.correctness || fallback.feedback.correctness,
        ),
        clarity: String(parsed?.feedback?.clarity || fallback.feedback.clarity),
        optimization: String(
          parsed?.feedback?.optimization || fallback.feedback.optimization,
        ),
        communication: String(
          parsed?.feedback?.communication || fallback.feedback.communication,
        ),
        overall: String(parsed?.feedback?.overall || fallback.feedback.overall),
        improvements: Array.isArray(parsed?.feedback?.improvements)
          ? parsed.feedback.improvements.slice(0, 6).map((v) => String(v))
          : fallback.feedback.improvements,
      },
    };
  } catch {
    return fallback;
  }
}
