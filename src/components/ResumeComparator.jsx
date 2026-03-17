import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  GitCompare,
  Upload,
  Loader2,
  CheckCircle2,
  XCircle,
  Trophy,
  Minus,
  Zap,
  Sparkles,
  Star,
  BarChart2,
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

const SAMPLE_A = {
  name: "Resume A",
  ats: 72,
  skillMatch: 68,
  experience: 1.5,
  projects: 3,
  education: "B.Tech CS",
  skills: ["React", "JavaScript", "Node.js", "Python", "SQL", "Git"],
  strengths: ["Strong React skills", "Good projects", "Clear formatting"],
  weaknesses: [
    "Missing TypeScript",
    "No quantified achievements",
    "Short on keywords",
  ],
};
const SAMPLE_B = {
  name: "Resume B",
  ats: 85,
  skillMatch: 82,
  experience: 2.5,
  projects: 5,
  education: "B.Tech CS",
  skills: [
    "React",
    "TypeScript",
    "Node.js",
    "Python",
    "Docker",
    "AWS",
    "Git",
    "Kubernetes",
  ],
  strengths: [
    "More skills coverage",
    "Quantified achievements",
    "Docker & AWS listed",
  ],
  weaknesses: ["Font inconsistency", "Summary could be stronger"],
};

function ProgressBar({ value, max, color }) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${pct}%` }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className={cn("h-full rounded-full", color)}
      />
    </div>
  );
}

function ResumeUploadSlot({ label, file, onFile, color, error }) {
  const onDrop = useCallback(
    (e) => {
      e.preventDefault();
      const f = e.dataTransfer?.files[0] || e.target.files?.[0];
      if (f) onFile(f);
    },
    [onFile],
  );

  return (
    <div
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
      onClick={() => document.getElementById(`compare-${label}`).click()}
      className={cn(
        "border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all",
        file
          ? "border-emerald-500/40 bg-emerald-500/5"
          : "border-white/10 hover:border-white/20 bg-slate-900/30",
      )}
    >
      <input
        id={`compare-${label}`}
        type="file"
        accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={(e) => onFile(e.target.files[0])}
      />
      {file ? (
        <div className="space-y-2">
          <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
          <div className="text-white font-black">{file.name}</div>
          <div className="text-slate-500 text-xs">
            {(file.size / 1024).toFixed(1)} KB
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <Upload size={40} className={cn("mx-auto", color)} />
          <div className="text-white font-black">{label}</div>
          <div className="text-slate-500 text-sm">PDF or DOCX</div>
        </div>
      )}
      {error && (
        <div className="mt-3 text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-3 py-2">
          {error}
        </div>
      )}
    </div>
  );
}

function MetricRow({ label, a, b, format = (v) => v }) {
  const aWins = a > b;
  const tie = a === b;
  const total = a + b;
  const aWidth = total > 0 ? (a / total) * 100 : 50;
  const bWidth = total > 0 ? (b / total) * 100 : 50;
  return (
    <div className="flex items-center gap-4 py-3 border-b border-white/5">
      <div className="w-32 text-slate-500 text-xs font-black uppercase">
        {label}
      </div>
      <div className="flex-1 flex items-center gap-3">
        <span
          className={cn(
            "font-black text-sm w-12 text-right",
            aWins
              ? "text-emerald-400"
              : tie
                ? "text-slate-400"
                : "text-slate-300",
          )}
        >
          {format(a)}
        </span>
        <div className="flex-1 relative h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${aWidth}%` }}
            transition={{ duration: 0.8 }}
            className="absolute left-0 top-0 h-full bg-cyan-500 rounded-full"
          />
        </div>
        <div className="w-2 h-2 rounded-full bg-white/20 shrink-0" />
        <div className="flex-1 relative h-2 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${bWidth}%` }}
            transition={{ duration: 0.8 }}
            className="absolute right-0 top-0 h-full bg-purple-500 rounded-full"
          />
        </div>
        <span
          className={cn(
            "font-black text-sm w-12",
            !aWins
              ? "text-emerald-400"
              : tie
                ? "text-slate-400"
                : "text-slate-300",
          )}
        >
          {format(b)}
        </span>
      </div>
      <div className="w-6 flex justify-center">
        {aWins ? (
          <span className="text-cyan-400 text-xs font-black">A</span>
        ) : !tie ? (
          <span className="text-purple-400 text-xs font-black">B</span>
        ) : (
          <Minus size={12} className="text-slate-600" />
        )}
      </div>
    </div>
  );
}

export function ResumeComparator() {
  const [fileA, setFileA] = useState(null);
  const [fileB, setFileB] = useState(null);
  const [validatingA, setValidatingA] = useState(false);
  const [validatingB, setValidatingB] = useState(false);
  const [errorA, setErrorA] = useState("");
  const [errorB, setErrorB] = useState("");
  const [compareError, setCompareError] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileA = async (file) => {
    if (!file) return;
    const fileError = getResumeFileError(file);
    if (fileError) {
      setErrorA(fileError);
      return;
    }
    setValidatingA(true);
    setErrorA("");
    setCompareError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      await api.postForm("/ai/resume/validate", formData);
      setFileA(file);
    } catch (err) {
      setFileA(null);
      setErrorA(err?.message || "This file is not a valid resume.");
    } finally {
      setValidatingA(false);
    }
  };

  const handleFileB = async (file) => {
    if (!file) return;
    const fileError = getResumeFileError(file);
    if (fileError) {
      setErrorB(fileError);
      return;
    }
    setValidatingB(true);
    setErrorB("");
    setCompareError("");
    try {
      const formData = new FormData();
      formData.append("resume", file);
      await api.postForm("/ai/resume/validate", formData);
      setFileB(file);
    } catch (err) {
      setFileB(null);
      setErrorB(err?.message || "This file is not a valid resume.");
    } finally {
      setValidatingB(false);
    }
  };

  const mapAnalysis = (analysis, fallbackName) => {
    const skills = analysis?.skillsFound || [];
    const missing = analysis?.skillsMissing || [];
    const totalSkills = Math.max(skills.length + missing.length, 1);

    return {
      name: analysis?.fileName || fallbackName,
      ats: Number(analysis?.atsScore || 0),
      skillMatch: Math.round((skills.length / totalSkills) * 100),
      experience: Number(analysis?.rawResult?.experience?.years || 0),
      projects: Number(analysis?.rawResult?.projects?.count || 0),
      education: analysis?.rawResult?.education?.degree || "Not detected",
      skills,
      strengths:
        analysis?.strengths?.length > 0
          ? analysis.strengths
          : ["Core skills detected"],
      weaknesses:
        analysis?.weaknesses?.length > 0
          ? analysis.weaknesses
          : ["No major weaknesses detected"],
    };
  };

  const compare = async () => {
    if (!fileA || !fileB) return;
    setLoading(true);
    setCompareError("");
    try {
      const formA = new FormData();
      formA.append("resume", fileA);
      const formB = new FormData();
      formB.append("resume", fileB);

      const [{ analysis: analysisA }, { analysis: analysisB }] =
        await Promise.all([
          api.postForm("/ai/resume/analyze", formA),
          api.postForm("/ai/resume/analyze", formB),
        ]);

      const comparison = await api.post("/ai/resume/compare", {
        resumeA: analysisA,
        resumeB: analysisB,
      });

      setResult({
        a: mapAnalysis(analysisA, fileA.name),
        b: mapAnalysis(analysisB, fileB.name),
        comparison,
      });
    } catch (err) {
      setResult(null);
      setCompareError(
        err?.message ||
          "Unable to compare these files. Please upload valid resumes.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (result) {
    const { a, b } = result;
    const aScore =
      a.ats +
      a.skillMatch +
      a.experience * 10 +
      a.skills.length * 2 +
      a.projects * 5;
    const bScore =
      b.ats +
      b.skillMatch +
      b.experience * 10 +
      b.skills.length * 2 +
      b.projects * 5;
    const winner = aScore > bScore ? "A" : bScore > aScore ? "B" : null;

    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <GitCompare className="text-pink-400" />
            Comparison Results
          </h1>
          <button
            onClick={() => {
              setResult(null);
              setFileA(null);
              setFileB(null);
            }}
            className="flex items-center gap-2 text-slate-500 hover:text-white text-sm font-bold"
          >
            <X size={16} />
            New Comparison
          </button>
        </div>

        {/* Winner banner */}
        {winner && (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "text-center py-8 rounded-3xl border",
              winner === "A"
                ? "bg-cyan-500/10 border-cyan-500/30"
                : "bg-purple-500/10 border-purple-500/30",
            )}
          >
            <Trophy size={48} className="text-yellow-400 mx-auto mb-3" />
            <div className="text-3xl font-black text-white mb-1">
              Resume {winner} Wins!
            </div>
            <div className="text-slate-400">
              {winner === "A" ? a.name : b.name} has a stronger overall profile
            </div>
          </motion.div>
        )}

        {/* Resume headers */}
        <div className="grid grid-cols-[1fr_auto_1fr] gap-4 items-center">
          <div
            className={cn(
              "text-center p-4 rounded-2xl border",
              winner === "A"
                ? "border-cyan-500/30 bg-cyan-500/5"
                : "border-white/5 bg-slate-900/40",
            )}
          >
            <div className="text-slate-500 text-xs font-black uppercase mb-1">
              Resume A
            </div>
            <div className="text-white font-black text-sm truncate">
              {a.name}
            </div>
            <div className="text-4xl font-black text-cyan-400 mt-2">
              {Math.round(aScore)}
            </div>
            <div className="text-xs text-slate-500">total score</div>
          </div>
          <div className="text-slate-600 font-black text-2xl">VS</div>
          <div
            className={cn(
              "text-center p-4 rounded-2xl border",
              winner === "B"
                ? "border-purple-500/30 bg-purple-500/5"
                : "border-white/5 bg-slate-900/40",
            )}
          >
            <div className="text-slate-500 text-xs font-black uppercase mb-1">
              Resume B
            </div>
            <div className="text-white font-black text-sm truncate">
              {b.name}
            </div>
            <div className="text-4xl font-black text-purple-400 mt-2">
              {Math.round(bScore)}
            </div>
            <div className="text-xs text-slate-500">total score</div>
          </div>
        </div>

        {/* Metrics */}
        <div className="bg-slate-900/50 border border-white/10 rounded-3xl p-6">
          <div className="flex items-center gap-8 mb-4 text-xs font-black text-slate-500 uppercase">
            <div className="w-32" />
            <span className="flex-1 text-center text-cyan-400">Resume A</span>
            <span className="flex-1 text-center text-purple-400">Resume B</span>
            <div className="w-6" />
          </div>
          <MetricRow
            label="ATS Score"
            a={a.ats}
            b={b.ats}
            format={(v) => `${v}`}
          />
          <MetricRow
            label="Skill Match"
            a={a.skillMatch}
            b={b.skillMatch}
            format={(v) => `${v}%`}
          />
          <MetricRow
            label="Experience"
            a={a.experience}
            b={b.experience}
            format={(v) => `${v}y`}
          />
          <MetricRow label="Projects" a={a.projects} b={b.projects} />
          <MetricRow
            label="Skills Count"
            a={a.skills.length}
            b={b.skills.length}
          />
        </div>

        {/* Skills comparison */}
        <div className="grid grid-cols-2 gap-6">
          {[
            {
              data: a,
              color: "text-cyan-400",
              label: "A",
              bg: "bg-cyan-500/10",
              border: "border-cyan-500/20",
            },
            {
              data: b,
              color: "text-purple-400",
              label: "B",
              bg: "bg-purple-500/10",
              border: "border-purple-500/20",
            },
          ].map(({ data, color, label, bg, border }) => (
            <div
              key={label}
              className="bg-slate-900/50 border border-white/10 rounded-3xl p-6"
            >
              <div
                className={cn(
                  "text-xs font-black uppercase tracking-widest mb-4",
                  color,
                )}
              >
                Resume {label} Skills
              </div>
              <div className="flex flex-wrap gap-1.5 mb-4">
                {data.skills.map((s) => (
                  <span
                    key={s}
                    className={cn(
                      "px-2.5 py-1 rounded-full text-xs font-bold border",
                      bg,
                      border,
                      color,
                    )}
                  >
                    {s}
                  </span>
                ))}
              </div>
              <div className="space-y-2 mt-4">
                <div className="text-xs font-black text-emerald-400 uppercase">
                  Strengths
                </div>
                {data.strengths.map((s) => (
                  <div
                    key={s}
                    className="text-sm text-slate-300 flex items-start gap-2"
                  >
                    <CheckCircle2
                      size={12}
                      className="text-emerald-500 mt-0.5 shrink-0"
                    />
                    {s}
                  </div>
                ))}
                <div className="text-xs font-black text-red-400 uppercase mt-3">
                  Gaps
                </div>
                {data.weaknesses.map((w) => (
                  <div
                    key={w}
                    className="text-sm text-slate-300 flex items-start gap-2"
                  >
                    <XCircle
                      size={12}
                      className="text-red-500 mt-0.5 shrink-0"
                    />
                    {w}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
          <GitCompare className="text-pink-400" size={36} /> RESUME COMPARATOR
        </h1>
        <p className="text-slate-400">
          Upload two resumes and let AI pick the better one.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <ResumeUploadSlot
          label="Resume A"
          file={fileA}
          onFile={handleFileA}
          error={errorA}
          color="text-cyan-400"
        />
        <ResumeUploadSlot
          label="Resume B"
          file={fileB}
          onFile={handleFileB}
          error={errorB}
          color="text-purple-400"
        />
      </div>

      <button
        onClick={compare}
        disabled={!fileA || !fileB || loading || validatingA || validatingB}
        className="w-full py-4 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:hover:scale-100 text-lg shadow-[0_0_30px_rgba(236,72,153,0.3)]"
      >
        {validatingA || validatingB ? (
          <>
            <Loader2 className="animate-spin" size={22} /> Verifying resumes...
          </>
        ) : loading ? (
          <>
            <Loader2 className="animate-spin" size={22} /> Comparing...
          </>
        ) : (
          <>
            <Sparkles size={22} /> Compare Resumes
          </>
        )}
      </button>

      {compareError && (
        <div className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2">
          {compareError}
        </div>
      )}
    </div>
  );
}
