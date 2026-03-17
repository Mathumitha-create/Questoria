import express from "express";
import axios from "axios";
import multer from "multer";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { requireAuth } from "../middleware/auth.js";
import { ResumeAnalysis } from "../models/ResumeAnalysis.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";
const MIN_RESUME_WORD_COUNT = 80;

const RESUME_KEYWORD_GROUPS = {
  basicIdentifiers: [
    "resume",
    "curriculum vitae",
    "cv",
    "profile summary",
    "career objective",
  ],
  personalInformation: [
    "name",
    "email",
    "phone",
    "address",
    "linkedin",
    "github",
    "portfolio",
  ],
  education: [
    "education",
    "academic background",
    "degree",
    "university",
    "college",
    "school",
    "cgpa",
    "gpa",
    "graduation",
  ],
  workExperience: [
    "experience",
    "work experience",
    "internship",
    "employment",
    "job role",
    "company",
    "responsibilities",
    "achievements",
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
  certificationsAndAchievements: [
    "certifications",
    "certificate",
    "achievements",
    "awards",
    "honors",
  ],
  additionalSections: [
    "hobbies",
    "interests",
    "languages",
    "references",
    "declaration",
  ],
};

const RESUME_GROUP_KEYS = {
  basicIdentifiers: "summary",
  education: "education",
  workExperience: "experience",
  skills: "skills",
  projects: "projects",
  certificationsAndAchievements: "certifications",
  additionalSections: "additional",
};

const RESUME_SECTION_PATTERNS = new Map(
  Object.entries(RESUME_GROUP_KEYS).map(([group, key]) => [
    key,
    new RegExp(
      `\\b(${RESUME_KEYWORD_GROUPS[group]
        .map((value) => value.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&"))
        .join("|")})\\b`,
    ),
  ]),
);

const NON_RESUME_PATTERNS = [
  {
    label: "invoice-like content",
    pattern:
      /\b(invoice|bill to|amount due|purchase order|subtotal|gst|tax invoice)\b/,
  },
  {
    label: "academic question paper",
    pattern:
      /\b(question paper|section a|section b|semester exam|marks allotted|answer any)\b/,
  },
  {
    label: "certificate-only content",
    pattern:
      /\b(certificate of completion|this is to certify|successfully completed|awarded this certificate)\b/,
  },
  {
    label: "form-like content",
    pattern:
      /\b(application form|fill in the blanks|declaration by applicant|signature of candidate)\b/,
  },
  {
    label: "book or article content",
    pattern:
      /\b(chapter 1|table of contents|references|abstract|introduction)\b/,
  },
];

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

function isAllowedResumeFile(file) {
  if (!file) return false;
  const mime = String(file.mimetype || "").toLowerCase();
  const name = String(file.originalname || "").toLowerCase();

  return (
    ALLOWED_RESUME_MIME_TYPES.has(mime) ||
    name.endsWith(".pdf") ||
    name.endsWith(".docx")
  );
}

function getFileExtension(fileName = "") {
  const lastDot = String(fileName).lastIndexOf(".");
  return lastDot >= 0 ? fileName.slice(lastDot).toLowerCase() : "";
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function normalizeWhitespace(value = "") {
  return String(value)
    .replace(/\u0000/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function looksLikePdf(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length >= 5 &&
    buffer.subarray(0, 5).toString("utf8") === "%PDF-"
  );
}

function looksLikeZip(buffer) {
  return (
    Buffer.isBuffer(buffer) &&
    buffer.length >= 4 &&
    buffer[0] === 0x50 &&
    buffer[1] === 0x4b &&
    [0x03, 0x05, 0x07].includes(buffer[2]) &&
    [0x04, 0x06, 0x08].includes(buffer[3])
  );
}

function validateDocumentSignature(file) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ext = getFileExtension(file?.originalname || "");
  const buffer = file?.buffer;

  if ((mime === "application/pdf" || ext === ".pdf") && !looksLikePdf(buffer)) {
    return "The uploaded PDF appears to be corrupted or renamed from another file type.";
  }

  if (
    (mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
      ext === ".docx") &&
    !looksLikeZip(buffer)
  ) {
    return "The uploaded DOCX appears to be corrupted or renamed from another file type.";
  }

  return "";
}

async function extractTextFromResumeFile(file) {
  const mime = String(file?.mimetype || "").toLowerCase();
  const ext = getFileExtension(file?.originalname || "");

  if (mime === "application/pdf" || ext === ".pdf") {
    const parser = new PDFParse({ data: file.buffer });
    try {
      const result = await parser.getText();
      return normalizeWhitespace(result?.text || "");
    } finally {
      await parser.destroy();
    }
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    const result = await mammoth.extractRawText({ buffer: file.buffer });
    return normalizeWhitespace(result?.value || "");
  }

  return "";
}

function buildHeuristicResumeValidation(text, file) {
  const normalizedText = normalizeWhitespace(text);
  const lowerText = normalizedText.toLowerCase();
  const words =
    normalizedText.length > 0
      ? normalizedText.split(/\s+/).filter(Boolean)
      : [];
  const wordCount = words.length;
  const detectedSections = Array.from(RESUME_SECTION_PATTERNS.entries())
    .filter(([, pattern]) => pattern.test(lowerText))
    .map(([section]) => section);

  const detectedKeywordGroups = Object.entries(RESUME_KEYWORD_GROUPS)
    .filter(([, keywords]) =>
      keywords.some((keyword) =>
        new RegExp(
          `\\b${keyword.replace(/[.*+?^${}()|[\\]\\]/g, "\\\\$&")}\\b`,
        ).test(lowerText),
      ),
    )
    .map(([group]) => group);

  const hasEmail = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i.test(
    normalizedText,
  );
  const hasPhone = /(?:\+?\d[\d\s().-]{7,}\d)/.test(normalizedText);
  const hasLinkedIn = /linkedin(?:\.com)?\b/.test(lowerText);
  const hasGithub = /github(?:\.com)?\b/.test(lowerText);
  const hasPortfolio =
    /\b(portfolio|behance|dribbble|leetcode|hackerrank|codeforces)\b/.test(
      lowerText,
    );
  const resumeSignalCount = detectedKeywordGroups.length;
  const nonResumeSignals = NON_RESUME_PATTERNS.filter(({ pattern }) =>
    pattern.test(lowerText),
  ).map(({ label }) => label);
  const missingCriticalSections = [];

  if (!(hasEmail || hasPhone || hasLinkedIn || hasGithub)) {
    missingCriticalSections.push("contact");
  }

  for (const section of ["experience", "education", "skills"]) {
    if (!detectedSections.includes(section)) {
      missingCriticalSections.push(section);
    }
  }

  let score = 0.05;

  if (wordCount >= 140) score += 0.2;
  else if (wordCount >= MIN_RESUME_WORD_COUNT) score += 0.1;
  else score -= 0.22;

  if (hasEmail) score += 0.14;
  if (hasPhone) score += 0.14;
  if (hasLinkedIn || hasGithub || hasPortfolio) score += 0.08;
  score += Math.min(detectedSections.length, 6) * 0.08;
  score += Math.min(resumeSignalCount, 8) * 0.06;

  if (detectedKeywordGroups.includes("basicIdentifiers")) {
    score += 0.08;
  }

  if (
    detectedKeywordGroups.includes("workExperience") &&
    detectedKeywordGroups.includes("education") &&
    detectedKeywordGroups.includes("skills")
  ) {
    score += 0.08;
  }

  if (nonResumeSignals.length > 0) {
    score -= Math.min(0.5, nonResumeSignals.length * 0.2);
  }

  if (wordCount > 2500) {
    score -= 0.08;
  }

  const confidence = Number(clamp(score, 0, 0.99).toFixed(2));
  const hasCoreResumeStructure =
    detectedSections.length >= 3 &&
    detectedSections.some((section) =>
      ["experience", "education", "skills", "projects"].includes(section),
    ) &&
    detectedKeywordGroups.includes("workExperience") &&
    detectedKeywordGroups.includes("education") &&
    detectedKeywordGroups.includes("skills") &&
    (hasEmail || hasPhone || hasLinkedIn || hasGithub);

  let reason = "The document matches common resume structure.";
  if (nonResumeSignals.length > 0) {
    reason = `The document looks more like ${nonResumeSignals.join(", ")} than a resume.`;
  } else if (wordCount < MIN_RESUME_WORD_COUNT) {
    reason =
      "The document contains too little readable text to be a complete resume.";
  } else if (!(hasEmail || hasPhone || hasLinkedIn || hasGithub)) {
    reason =
      "Missing clear candidate contact details such as email, phone, LinkedIn, or GitHub.";
  } else if (detectedSections.length < 2) {
    reason =
      "Missing enough resume sections such as experience, education, skills, or projects.";
  }

  return {
    isResume: hasCoreResumeStructure && confidence >= 0.62,
    confidence,
    detectedSections,
    missingCriticalSections,
    reason,
    validationMethod: "heuristic",
    fileName: file?.originalname || "resume",
    textMetrics: {
      wordCount,
      keywordGroupHits: detectedKeywordGroups.length,
      contactSignals: [
        hasEmail,
        hasPhone,
        hasLinkedIn,
        hasGithub,
        hasPortfolio,
      ].filter(Boolean).length,
    },
    detectedKeywordGroups,
  };
}

function mergeResumeValidations(heuristicValidation, aiValidation) {
  if (!aiValidation) {
    return heuristicValidation;
  }

  const aiConfidence = Number(aiValidation?.confidence || 0);
  if (aiValidation?.isResume === false && aiConfidence >= 0.55) {
    return {
      ...heuristicValidation,
      isResume: false,
      confidence: Number(
        ((heuristicValidation.confidence + aiConfidence) / 2).toFixed(2),
      ),
      detectedSections: Array.from(
        new Set([
          ...(heuristicValidation.detectedSections || []),
          ...(aiValidation.detectedSections || []),
        ]),
      ),
      reason: aiValidation.reason || heuristicValidation.reason,
      aiValidation,
    };
  }

  const mergedSections = Array.from(
    new Set([
      ...(heuristicValidation.detectedSections || []),
      ...(aiValidation.detectedSections || []),
    ]),
  );
  const mergedMissingSections = Array.from(
    new Set(
      [
        ...(heuristicValidation.missingCriticalSections || []),
        ...(aiValidation.missingCriticalSections || []),
      ].filter((section) => !mergedSections.includes(section)),
    ),
  );

  return {
    ...heuristicValidation,
    isResume: true,
    confidence: Number(
      (
        (heuristicValidation.confidence +
          Math.max(aiConfidence, heuristicValidation.confidence)) /
        2
      ).toFixed(2),
    ),
    detectedSections: mergedSections,
    missingCriticalSections: mergedMissingSections,
    aiValidation,
  };
}

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

function extractGeminiErrorMessage(error) {
  const apiMessage =
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    "Gemini API request failed";

  const statusCode = Number(error?.response?.status || 0);
  if (statusCode > 0) {
    return `${apiMessage} (status ${statusCode})`;
  }
  return apiMessage;
}

function isQuotaExceededError(error) {
  const statusCode = Number(error?.statusCode || error?.response?.status || 0);
  if (statusCode === 429) return true;

  const message = String(
    error?.message || error?.response?.data?.error?.message || "",
  ).toLowerCase();

  return (
    message.includes("quota exceeded") ||
    message.includes("resource_exhausted") ||
    message.includes("rate limit")
  );
}

function createFallbackAnalysis(fileName, validation, fallbackReason) {
  const detectedSections = validation?.detectedSections || [];
  const missingSections = validation?.missingCriticalSections || [];
  const atsScore = Math.round(
    clamp(
      48 +
        detectedSections.length * 9 -
        missingSections.length * 6 +
        Number(validation?.confidence || 0) * 20,
      35,
      82,
    ),
  );
  const strengths = [];
  const weaknesses = [];
  const suggestions = [];

  if (detectedSections.includes("experience")) {
    strengths.push("Experience section detected");
  }
  if (detectedSections.includes("skills")) {
    strengths.push("Skills section detected");
  }
  if (detectedSections.includes("projects")) {
    strengths.push("Projects section detected");
  }

  if (missingSections.includes("contact")) {
    weaknesses.push("Missing clear contact details");
    suggestions.push(
      "Add your email, phone number, and at least one professional profile link.",
    );
  }
  if (missingSections.includes("experience")) {
    weaknesses.push("Work experience section is missing or weak");
    suggestions.push(
      "Add a work experience section with quantified impact and technologies used.",
    );
  }
  if (missingSections.includes("education")) {
    weaknesses.push("Education section is missing or weak");
    suggestions.push(
      "Include your degree, institution, graduation year, and relevant coursework if applicable.",
    );
  }
  if (missingSections.includes("skills")) {
    weaknesses.push("Skills section is missing or weak");
    suggestions.push(
      "Add a concise technical skills section aligned with the roles you are targeting.",
    );
  }

  if (suggestions.length === 0) {
    suggestions.push(
      "Add more quantified achievements and tailor keywords to the target job description.",
    );
  }

  return {
    fileName: fileName || "resume",
    atsScore,
    skillsFound: [],
    skillsMissing: [],
    strengths:
      strengths.length > 0
        ? strengths
        : ["Resume structure detected successfully"],
    weaknesses:
      weaknesses.length > 0
        ? weaknesses
        : [
            fallbackReason === "gemini-unavailable"
              ? "AI analysis is unavailable because no Gemini API key is configured"
              : "AI analysis is temporarily unavailable due to Gemini quota limits",
          ],
    suggestions,
    summary:
      fallbackReason === "gemini-unavailable"
        ? "Your resume passed structural validation, but full AI scoring is unavailable because the Gemini API key is not configured."
        : "Your resume passed structural validation, but full AI scoring is temporarily unavailable because the Gemini API quota is exhausted.",
    experience: { years: 0, positions: 0 },
    education: { found: detectedSections.includes("education") },
    projects: { count: detectedSections.includes("projects") ? 1 : 0 },
    fallback: true,
    fallbackReason,
    validation,
  };
}

async function generateGeminiContent(apiKey, contents) {
  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      { contents },
    );
    return response;
  } catch (error) {
    const message = extractGeminiErrorMessage(error);
    const wrapped = new Error(message);
    wrapped.cause = error;
    wrapped.statusCode = Number(error?.response?.status || 0);
    wrapped.isQuotaExceeded = isQuotaExceededError(error);
    throw wrapped;
  }
}

async function validateResumeDocument(file, apiKey) {
  const base64 = file.buffer.toString("base64");
  const prompt = `You are a strict document validator for a resume analyzer.
Decide whether the uploaded file is a real professional resume/CV.

Return ONLY strict JSON with keys:
- isResume (boolean)
- confidence (number between 0 and 1)
- detectedSections (array of strings)
- missingCriticalSections (array of strings)
- reason (string)

Treat as valid resume/CV if the document is primarily a candidate profile and contains strong resume-like structure (skills/experience/education/projects/summary/contact etc.).
Reject unrelated PDFs like certificates only, invoices, books, assignment sheets, random forms, or blank documents.`;

  const response = await generateGeminiContent(apiKey, [
    {
      parts: [
        { text: prompt },
        {
          inline_data: {
            mime_type: file.mimetype,
            data: base64,
          },
        },
      ],
    },
  ]);

  const raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  return parseFirstJsonObject(raw, {
    isResume: false,
    confidence: 0,
    detectedSections: [],
    missingCriticalSections: [],
    reason: "Unable to validate document type",
  });
}

async function runResumeValidationChecks(req, res) {
  if (!req.file) {
    return {
      ok: false,
      response: res.status(400).json({ message: "resume file is required" }),
    };
  }

  if (!isAllowedResumeFile(req.file)) {
    return {
      ok: false,
      response: res.status(400).json({
        message: "Only resume files in PDF or DOCX format are allowed",
      }),
    };
  }

  if (Number(req.file.size || 0) > MAX_RESUME_SIZE_BYTES) {
    return {
      ok: false,
      response: res
        .status(400)
        .json({ message: "Resume size must be 5MB or less" }),
    };
  }

  const signatureMessage = validateDocumentSignature(req.file);
  if (signatureMessage) {
    return {
      ok: false,
      response: res.status(400).json({ message: signatureMessage }),
    };
  }

  let extractedText = "";
  try {
    extractedText = await extractTextFromResumeFile(req.file);
  } catch {
    return {
      ok: false,
      response: res.status(400).json({
        message:
          "We could not read this file as a valid PDF or DOCX resume. Please upload a readable resume document.",
      }),
    };
  }

  const heuristicValidation = buildHeuristicResumeValidation(
    extractedText,
    req.file,
  );
  if (!heuristicValidation.isResume) {
    const reason =
      heuristicValidation.reason ||
      "The uploaded file does not appear to be a valid resume.";
    return {
      ok: false,
      response: res.status(400).json({
        message: `Invalid resume document: ${reason}`,
        validation: heuristicValidation,
      }),
    };
  }

  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    return {
      ok: true,
      validation: {
        ...heuristicValidation,
        aiValidationSkipped: true,
      },
      apiKey: "",
      quotaLimited: false,
      aiUnavailable: true,
    };
  }

  let validation = heuristicValidation;
  let quotaLimited = false;
  try {
    const aiValidation = await validateResumeDocument(req.file, apiKey);
    validation = mergeResumeValidations(heuristicValidation, aiValidation);
  } catch (error) {
    if (!isQuotaExceededError(error)) {
      throw error;
    }

    quotaLimited = true;
    validation = {
      ...heuristicValidation,
      quotaLimited: true,
      reason:
        "Validated using document structure because AI validation is temporarily rate-limited.",
    };
  }

  const confidence = Number(validation?.confidence || 0);
  if (!validation?.isResume || confidence < 0.6) {
    const reason =
      validation?.reason ||
      "The uploaded file does not appear to be a valid resume.";
    return {
      ok: false,
      response: res.status(400).json({
        message: `Invalid resume document: ${reason}`,
        validation,
      }),
    };
  }

  return {
    ok: true,
    validation,
    apiKey,
    quotaLimited,
    aiUnavailable: false,
  };
}

router.post(
  "/mentor",
  requireAuth,
  asyncHandler(async (req, res) => {
    const { message, context = "" } = req.body;
    if (!message)
      return res.status(400).json({ message: "message is required" });

    const apiKey = getGeminiApiKey();
    if (!apiKey) {
      return res.json({
        reply:
          "AI mentor is running in fallback mode. Configure GEMINI_API_KEY (or VITE_GEMINI_KEY) for live responses.",
      });
    }

    const prompt = `You are QUESTORIA AI mentor. Guide without giving complete solutions unless explicitly asked.\nContext: ${context}\nUser: ${message}`;

    let response;
    try {
      response = await generateGeminiContent(apiKey, [
        { parts: [{ text: prompt }] },
      ]);
    } catch (error) {
      if (!isQuotaExceededError(error)) throw error;

      return res.json({
        reply:
          "I hit a temporary AI quota limit. Please retry shortly, or configure a paid Gemini plan for uninterrupted mentor responses.",
        fallback: true,
        reason: "gemini-quota-exceeded",
      });
    }

    const reply =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I could not generate a response right now.";

    return res.json({ reply });
  }),
);

router.post(
  "/resume/validate",
  requireAuth,
  upload.single("resume"),
  asyncHandler(async (req, res) => {
    const checked = await runResumeValidationChecks(req, res);
    if (!checked.ok) return checked.response;
    return res.json({
      valid: true,
      validation: checked.validation,
      fallback: Boolean(checked.quotaLimited),
      fileName: req.file.originalname,
    });
  }),
);

router.post(
  "/resume/analyze",
  requireAuth,
  upload.single("resume"),
  asyncHandler(async (req, res) => {
    const checked = await runResumeValidationChecks(req, res);
    if (!checked.ok) return checked.response;
    const { apiKey, validation, quotaLimited, aiUnavailable } = checked;

    if (quotaLimited || aiUnavailable || !apiKey) {
      const fallbackResult = createFallbackAnalysis(
        req.file.originalname,
        validation,
        aiUnavailable || !apiKey
          ? "gemini-unavailable"
          : "gemini-quota-exceeded",
      );

      const doc = await ResumeAnalysis.create({
        user: req.user.sub,
        fileName: req.file.originalname,
        atsScore: Number(fallbackResult.atsScore || 0),
        skillsFound: fallbackResult.skillsFound || [],
        skillsMissing: fallbackResult.skillsMissing || [],
        strengths: fallbackResult.strengths || [],
        weaknesses: fallbackResult.weaknesses || [],
        suggestions: fallbackResult.suggestions || [],
        rawResult: fallbackResult,
      });

      return res.json({ analysis: doc, fallback: true });
    }

    const base64 = req.file.buffer.toString("base64");
    const prompt = `Analyze this resume and return strict JSON with keys: atsScore, skillsFound, skillsMissing, strengths, weaknesses, suggestions, summary, experience, education, projects.`;

    const response = await generateGeminiContent(apiKey, [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: req.file.mimetype,
              data: base64,
            },
          },
        ],
      },
    ]);

    const raw =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    const result = parseFirstJsonObject(raw, {});

    const doc = await ResumeAnalysis.create({
      user: req.user.sub,
      fileName: req.file.originalname,
      atsScore: Number(result.atsScore || 0),
      skillsFound: result.skillsFound || [],
      skillsMissing: result.skillsMissing || [],
      strengths: result.strengths || [],
      weaknesses: result.weaknesses || [],
      suggestions: result.suggestions || [],
      rawResult: {
        ...result,
        validation,
      },
    });

    return res.json({ analysis: doc });
  }),
);

router.post("/resume/compare", requireAuth, async (req, res) => {
  const { resumeA, resumeB } = req.body;
  if (!resumeA || !resumeB)
    return res
      .status(400)
      .json({ message: "resumeA and resumeB are required" });

  const scoreA =
    (resumeA.atsScore || 0) + (resumeA.skillsFound?.length || 0) * 2;
  const scoreB =
    (resumeB.atsScore || 0) + (resumeB.skillsFound?.length || 0) * 2;

  return res.json({
    betterResume: scoreA >= scoreB ? "A" : "B",
    scoreA,
    scoreB,
    suggestions: [
      "Use quantified impact statements",
      "Improve keyword density for ATS",
      "Prioritize most relevant projects at top",
    ],
  });
});

export default router;
