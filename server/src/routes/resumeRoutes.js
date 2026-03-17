import express from "express";
import axios from "axios";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { requireAuth } from "../middleware/auth.js";
import { ResumeAnalysis } from "../models/ResumeAnalysis.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE = 5 * 1024 * 1024;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

function getGeminiApiKey() {
  return (
    process.env.GEMINI_API_KEY ||
    process.env.VITE_GEMINI_KEY ||
    process.env.VITE_GEMINI_API_KEY ||
    ""
  );
}

function normalize(value = "") {
  return String(value)
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function parseJson(raw, fallback) {
  try {
    const match = String(raw || "").match(/\{[\s\S]*\}/);
    return JSON.parse(match ? match[0] : "{}");
  } catch {
    return fallback;
  }
}

async function extractResumeText(file) {
  const name = String(file?.originalname || "").toLowerCase();
  const mime = String(file?.mimetype || "").toLowerCase();

  if (mime === "application/pdf" || name.endsWith(".pdf")) {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return normalize(result?.text || "");
    } finally {
      await parser.destroy();
    }
  }

  const result = await mammoth.extractRawText({ buffer: file.buffer });
  return normalize(result?.value || "");
}

function detectResumeByStructure(text) {
  const lower = normalize(text).toLowerCase();
  const groups = {
    identity: [
      "resume",
      "curriculum vitae",
      "cv",
      "profile summary",
      "career objective",
    ],
    contact: ["email", "phone", "linkedin", "github", "portfolio", "address"],
    education: [
      "education",
      "degree",
      "university",
      "college",
      "cgpa",
      "gpa",
      "graduation",
    ],
    experience: [
      "experience",
      "work experience",
      "internship",
      "employment",
      "company",
      "responsibilities",
    ],
    skills: [
      "skills",
      "technical skills",
      "soft skills",
      "programming languages",
      "tools",
      "technologies",
    ],
    projects: [
      "projects",
      "personal projects",
      "academic projects",
      "portfolio projects",
    ],
  };

  const detected = Object.entries(groups)
    .filter(([, keywords]) => keywords.some((k) => lower.includes(k)))
    .map(([k]) => k);

  const wordCount = lower.length > 0 ? lower.split(/\s+/).length : 0;
  const isResume =
    wordCount >= 80 &&
    detected.includes("contact") &&
    detected.includes("education") &&
    detected.includes("experience") &&
    detected.includes("skills");

  const confidence = Math.min(
    0.98,
    Number((detected.length / 6 + (wordCount >= 140 ? 0.2 : 0)).toFixed(2)),
  );

  return {
    isResume,
    confidence,
    detectedSections: detected,
    missingCriticalSections: [
      "contact",
      "education",
      "experience",
      "skills",
    ].filter((s) => !detected.includes(s)),
    reason: isResume
      ? "Resume structure detected"
      : "Missing key resume sections or insufficient content",
    textMetrics: { wordCount },
  };
}

async function analyzeWithGemini(file, validation) {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      atsScore: Math.round(45 + validation.confidence * 40),
      skillsFound: [],
      skillsMissing: validation.missingCriticalSections || [],
      strengths: ["Resume uploaded and parsed successfully"],
      weaknesses: ["AI analysis unavailable: missing GEMINI_API_KEY"],
      suggestions: [
        "Configure GEMINI_API_KEY for richer AI analysis",
        "Add quantifiable achievements and targeted keywords",
      ],
      rawResult: {
        summary: "Resume parsed with structural validation only.",
        fallback: true,
        fallbackReason: "gemini-unavailable",
      },
      fallback: true,
    };
  }

  const prompt =
    "Analyze this resume and return strict JSON with keys: atsScore, skillsFound, skillsMissing, strengths, weaknesses, suggestions, summary, experience, education, projects.";

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: file.mimetype,
                data: file.buffer.toString("base64"),
              },
            },
          ],
        },
      ],
    },
  );

  const raw =
    response?.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const parsed = parseJson(raw, {});

  return {
    atsScore: Number(parsed.atsScore || 0),
    skillsFound: parsed.skillsFound || [],
    skillsMissing: parsed.skillsMissing || [],
    strengths: parsed.strengths || [],
    weaknesses: parsed.weaknesses || [],
    suggestions: parsed.suggestions || [],
    rawResult: {
      ...parsed,
      validation,
    },
    fallback: false,
  };
}

router.post(
  "/upload",
  requireAuth,
  upload.single("resume"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "resume file is required" });
    }

    if (!ALLOWED_TYPES.has(String(req.file.mimetype || "").toLowerCase())) {
      return res
        .status(400)
        .json({ message: "Only PDF or DOCX resumes are allowed" });
    }

    if (Number(req.file.size || 0) > MAX_RESUME_SIZE) {
      return res
        .status(400)
        .json({ message: "Resume size must be 5MB or less" });
    }

    let text = "";
    try {
      text = await extractResumeText(req.file);
    } catch {
      return res
        .status(400)
        .json({ message: "Unable to parse this resume file" });
    }

    const validation = detectResumeByStructure(text);
    if (!validation.isResume || validation.confidence < 0.6) {
      return res.status(400).json({
        message: `Invalid resume document: ${validation.reason}`,
        validation,
      });
    }

    let analysis;
    try {
      analysis = await analyzeWithGemini(req.file, validation);
    } catch {
      analysis = {
        atsScore: Math.round(45 + validation.confidence * 40),
        skillsFound: [],
        skillsMissing: validation.missingCriticalSections || [],
        strengths: ["Resume uploaded and parsed successfully"],
        weaknesses: ["AI analysis temporarily unavailable"],
        suggestions: [
          "Retry analysis shortly",
          "Keep resume sections concise and measurable",
        ],
        rawResult: {
          summary: "Resume parsed but AI service is currently unavailable.",
          validation,
          fallback: true,
        },
        fallback: true,
      };
    }

    const doc = await ResumeAnalysis.create({
      user: req.user.sub,
      fileName: req.file.originalname,
      atsScore: Number(analysis.atsScore || 0),
      skillsFound: analysis.skillsFound || [],
      skillsMissing: analysis.skillsMissing || [],
      strengths: analysis.strengths || [],
      weaknesses: analysis.weaknesses || [],
      suggestions: analysis.suggestions || [],
      rawResult: {
        ...(analysis.rawResult || {}),
        extractedPreview: text.slice(0, 2000),
        validation,
      },
    });

    return res.json({
      uploaded: true,
      validation,
      analysis: doc,
      fallback: Boolean(analysis.fallback),
    });
  },
);

router.get("/analysis", requireAuth, async (req, res) => {
  const analyses = await ResumeAnalysis.find({ user: req.user.sub })
    .sort({ createdAt: -1 })
    .limit(20)
    .select(
      "fileName atsScore skillsFound skillsMissing strengths weaknesses suggestions rawResult createdAt",
    );

  return res.json({ latest: analyses[0] || null, history: analyses });
});

export default router;
