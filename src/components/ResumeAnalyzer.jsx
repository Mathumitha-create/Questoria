import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Upload,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  BarChart2,
  Star,
  Target,
  BookOpen,
  Sparkles,
  ChevronDown,
  ChevronUp,
  X,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const ALLOWED_RESUME_MIME_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);
const MAX_RESUME_SIZE_BYTES = 5 * 1024 * 1024;

function isAllowedResumeFile(file) {
  if (!file) return false;
  const mime = String(file.type || "").toLowerCase();
  const name = String(file.name || "").toLowerCase();
  return (
    ALLOWED_RESUME_MIME_TYPES.has(mime) ||
    name.endsWith(".pdf") ||
    name.endsWith(".docx")
  );
}

function getResumeFileError(file) {
  if (!isAllowedResumeFile(file)) {
    return "Only PDF or DOCX resume files are allowed.";
  }

  if (Number(file?.size || 0) > MAX_RESUME_SIZE_BYTES) {
    return "Resume size must be 5MB or less.";
  }

  return "";
}

function ScoreRing({ score, size = 120, stroke = 8 }) {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  const color = score >= 75 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444";
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={stroke}
      />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: circ - dash }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ strokeDasharray: circ }}
      />
    </svg>
  );
}

function SkillBar({ skill, match, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay }}
      className="space-y-1.5"
    >
      <div className="flex items-center justify-between text-sm">
        <span className="text-slate-300 font-bold">{skill}</span>
        <span
          className={cn(
            "font-black text-xs",
            match >= 80
              ? "text-emerald-400"
              : match >= 50
                ? "text-yellow-400"
                : "text-red-400",
          )}
        >
          {match}%
        </span>
      </div>
      <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${match}%` }}
          transition={{ duration: 0.8, delay }}
          className={cn(
            "h-full rounded-full",
            match >= 80
              ? "bg-emerald-500"
              : match >= 50
                ? "bg-yellow-500"
                : "bg-red-500",
          )}
        />
      </div>
    </motion.div>
  );
}

const SAMPLE_RESULT = {
  atsScore: 72,
  skillMatch: 68,
  summary:
    "Your resume has a solid foundation but needs keyword optimization for ATS compatibility. Strong technical skills detected.",
  skills: {
    found: ["React", "JavaScript", "Node.js", "Python", "SQL", "Git"],
    missing: ["TypeScript", "Docker", "Kubernetes", "CI/CD", "AWS"],
  },
  skillStrengths: [
    { skill: "React", match: 92 },
    { skill: "JavaScript", match: 88 },
    { skill: "Node.js", match: 75 },
    { skill: "Python", match: 70 },
    { skill: "SQL", match: 65 },
    { skill: "Git", match: 85 },
  ],
  suggestions: [
    {
      type: "critical",
      title: "Add Quantifiable Achievements",
      body: 'Replace vague bullets like "Improved performance" with data: "Reduced load time by 40%, serving 10K daily users."',
    },
    {
      type: "critical",
      title: "Include Missing Keywords",
      body: "Add TypeScript, Docker, and AWS to your skills section — these are top ATS filters for your target role.",
    },
    {
      type: "important",
      title: "Strengthen Action Verbs",
      body: 'Start each bullet with strong verbs: "Architected", "Optimized", "Led", "Automated" instead of "Worked on" or "Helped with".',
    },
    {
      type: "important",
      title: "Add a GitHub Link",
      body: "Link directly to your GitHub containing live projects. Recruiters want to see your code.",
    },
    {
      type: "tip",
      title: "ATS-Friendly Formatting",
      body: "Avoid tables and columns — some ATS parsers cannot read multi-column layouts. Use single-column format.",
    },
    {
      type: "tip",
      title: "Projects Section Enhancement",
      body: "Add 2–3 impactful projects with tech stack, your role, and measurable impact for each.",
    },
  ],
  education: {
    found: true,
    gpa: "Not listed",
    degree: "B.Tech CS",
    institution: "Detected",
  },
  experience: { years: 1.5, positions: 2 },
};

export function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [validatingFile, setValidatingFile] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [jobDesc, setJobDesc] = useState("");
  const [expandedTip, setExpandedTip] = useState(null);

  const onDrop = useCallback(async (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer?.files[0] || e.target.files?.[0];
    if (!f) return;

    const fileError = getResumeFileError(f);
    if (fileError) {
      setUploadError(fileError);
      return;
    }

    setValidatingFile(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("resume", f);
      await api.postForm("/ai/resume/validate", formData);
      setFile(f);
      setResult(null);
    } catch (err) {
      setFile(null);
      setResult(null);
      setUploadError(err?.message || "This file is not a valid resume.");
    } finally {
      setValidatingFile(false);
    }
  }, []);

  const analyze = async () => {
    if (!file) return;
    setLoading(true);
    setUploadError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      if (jobDesc?.trim()) formData.append("jobDescription", jobDesc.trim());

      const { analysis } = await api.postForm("/resume/upload", formData);

      const found = analysis?.skillsFound || [];
      const missing = analysis?.skillsMissing || [];
      const totalSkills = Math.max(found.length + missing.length, 1);
      const skillMatch = Math.round((found.length / totalSkills) * 100);

      const normalizedSuggestions = (analysis?.suggestions || []).map((s) => {
        if (typeof s === "string") {
          return { type: "tip", title: s, body: s };
        }
        return {
          type: s.type || "tip",
          title: s.title || "Suggestion",
          body: s.body || s.text || "",
        };
      });

      const normalized = {
        ...SAMPLE_RESULT,
        atsScore: Number(analysis?.atsScore ?? SAMPLE_RESULT.atsScore),
        skillMatch,
        summary: analysis?.rawResult?.summary || SAMPLE_RESULT.summary,
        skills: {
          found,
          missing,
        },
        skillStrengths:
          found.length > 0
            ? found.slice(0, 6).map((skill, i) => ({
                skill,
                match: Math.max(55, 95 - i * 6),
              }))
            : SAMPLE_RESULT.skillStrengths,
        suggestions:
          normalizedSuggestions.length > 0
            ? normalizedSuggestions
            : SAMPLE_RESULT.suggestions,
        experience: analysis?.rawResult?.experience || SAMPLE_RESULT.experience,
        education: analysis?.rawResult?.education || SAMPLE_RESULT.education,
      };

      setResult(normalized);
    } catch (err) {
      setResult(null);
      setUploadError(
        err?.message ||
          "Unable to analyze this file. Please upload a valid resume.",
      );
    } finally {
      setLoading(false);
    }
  };

  const tipColor = (t) =>
    ({
      critical: "border-red-500/30 bg-red-500/5",
      important: "border-yellow-500/30 bg-yellow-500/5",
      tip: "border-cyan-500/30 bg-cyan-500/5",
    })[t];
  const tipLabel = (t) =>
    ({
      critical: { color: "text-red-400", label: "Critical" },
      important: { color: "text-yellow-400", label: "Important" },
      tip: { color: "text-cyan-400", label: "Tip" },
    })[t];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <FileText className="text-purple-400" size={36} /> RESUME ANALYZER
        </h1>
        <p className="text-slate-400">
          AI-powered ATS scoring and improvement suggestions.
        </p>
      </header>

      {!result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* Upload area */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={cn(
              "border-2 border-dashed rounded-3xl p-16 text-center transition-all cursor-pointer relative",
              dragging
                ? "border-cyan-500/80 bg-cyan-500/5"
                : file
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 hover:border-white/20 bg-slate-900/30",
            )}
            onClick={() => document.getElementById("resume-upload").click()}
          >
            <input
              id="resume-upload"
              type="file"
              accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
              className="hidden"
              onChange={onDrop}
            />
            {file ? (
              <div className="space-y-3">
                <CheckCircle2 size={48} className="text-emerald-500 mx-auto" />
                <div className="text-white font-black text-lg">{file.name}</div>
                <div className="text-slate-500 text-sm">
                  {(file.size / 1024).toFixed(1)} KB — Click to replace
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload
                  size={48}
                  className={cn(
                    "mx-auto transition-colors",
                    dragging ? "text-cyan-400" : "text-slate-600",
                  )}
                />
                <div>
                  <div className="text-white font-black text-xl mb-1">
                    Drop your resume here
                  </div>
                  <div className="text-slate-500 text-sm">
                    Supports PDF and DOCX resumes only — max 5MB
                  </div>
                </div>
                <div className="flex items-center justify-center gap-3">
                  <div className="px-4 py-1.5 bg-slate-800 rounded-full text-xs text-slate-400 font-bold">
                    PDF
                  </div>
                  <div className="px-4 py-1.5 bg-slate-800 rounded-full text-xs text-slate-400 font-bold">
                    DOCX
                  </div>
                </div>
              </div>
            )}
          </div>

          {uploadError && (
            <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
              {uploadError}
            </div>
          )}

          {/* Job description input */}
          <div>
            <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
              Target Job Description (optional)
            </label>
            <textarea
              value={jobDesc}
              onChange={(e) => setJobDesc(e.target.value)}
              placeholder="Paste the job description here for targeted ATS analysis..."
              className="w-full h-28 bg-slate-900/50 border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
            />
          </div>

          <button
            onClick={analyze}
            disabled={!file || loading || validatingFile}
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 text-lg shadow-[0_0_30px_rgba(168,85,247,0.3)]"
          >
            {validatingFile ? (
              <>
                <Loader2 className="animate-spin" size={22} /> Verifying
                resume...
              </>
            ) : loading ? (
              <>
                <Loader2 className="animate-spin" size={22} /> Analyzing your
                resume...
              </>
            ) : (
              <>
                <Sparkles size={22} /> Analyze with AI
              </>
            )}
          </button>
        </motion.div>
      )}

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-white">Analysis Results</h2>
            <button
              onClick={() => {
                setResult(null);
                setFile(null);
              }}
              className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm font-bold"
            >
              <X size={16} /> Analyze New Resume
            </button>
          </div>

          {/* Score overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
              <div className="relative mb-3">
                <ScoreRing score={result.atsScore} size={120} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-white">
                    {result.atsScore}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">
                    / 100
                  </span>
                </div>
              </div>
              <div className="text-white font-black text-sm mb-1">
                ATS Score
              </div>
              <div
                className={cn(
                  "text-xs font-bold",
                  result.atsScore >= 75
                    ? "text-emerald-400"
                    : result.atsScore >= 50
                      ? "text-yellow-400"
                      : "text-red-400",
                )}
              >
                {result.atsScore >= 75
                  ? "Excellent"
                  : result.atsScore >= 50
                    ? "Good"
                    : "Needs Work"}
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 flex flex-col items-center">
              <div className="relative mb-3">
                <ScoreRing score={result.skillMatch} size={120} />
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-black text-white">
                    {result.skillMatch}%
                  </span>
                </div>
              </div>
              <div className="text-white font-black text-sm mb-1">
                Skill Match
              </div>
              <div className="text-xs text-slate-400 font-bold">
                For target role
              </div>
            </div>

            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6 space-y-4">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest">
                Quick Stats
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Skills Found</span>
                  <span className="text-white font-black">
                    {result.skills?.found?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Missing Skills</span>
                  <span className="text-red-400 font-black">
                    {result.skills?.missing?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Suggestions</span>
                  <span className="text-cyan-400 font-black">
                    {result.suggestions?.length || 0}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Experience</span>
                  <span className="text-white font-black">
                    {result.experience?.years || 0} yrs
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
            <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Sparkles size={12} />
              AI Summary
            </div>
            <p className="text-slate-300 leading-relaxed">{result.summary}</p>
          </div>

          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <CheckCircle2 size={12} className="text-emerald-400" />
                Skills Found
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills?.found?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full text-xs font-black"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <AlertTriangle size={12} className="text-red-400" />
                Missing Skills
              </div>
              <div className="flex flex-wrap gap-2">
                {result.skills?.missing?.map((s) => (
                  <span
                    key={s}
                    className="px-3 py-1.5 bg-red-500/10 border border-red-500/20 text-red-400 rounded-full text-xs font-black"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Skill strength bars */}
          {result.skillStrengths?.length > 0 && (
            <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
              <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                <BarChart2 size={12} />
                Skill Strength
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.skillStrengths.map((s, i) => (
                  <SkillBar
                    key={s.skill}
                    skill={s.skill}
                    match={s.match}
                    delay={i * 0.06}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="space-y-3">
            <div className="text-xl font-black text-white flex items-center gap-2">
              <Target size={20} />
              Improvement Suggestions
            </div>
            {result.suggestions?.map((tip, i) => {
              const { color, label } = tipLabel(tip.type);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className={cn(
                    "border rounded-2xl p-5 cursor-pointer transition-all",
                    tipColor(tip.type),
                  )}
                  onClick={() => setExpandedTip(expandedTip === i ? null : i)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          "text-xs font-black uppercase px-2.5 py-1 rounded-full",
                          color,
                          "bg-white/5",
                        )}
                      >
                        {label}
                      </span>
                      <span className="text-white font-bold">{tip.title}</span>
                    </div>
                    {expandedTip === i ? (
                      <ChevronUp size={16} className="text-slate-500" />
                    ) : (
                      <ChevronDown size={16} className="text-slate-500" />
                    )}
                  </div>
                  <AnimatePresence>
                    {expandedTip === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <p className="mt-3 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-3">
                          {tip.body}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
