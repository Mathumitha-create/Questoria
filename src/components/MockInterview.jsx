import React, { useEffect, useMemo, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion } from "framer-motion";
import {
  BarChart3,
  BrainCircuit,
  Loader2,
  Mic,
  Play,
  Send,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
import { api } from "../lib/api";
import { Timer } from "./Timer";

const TYPE_OPTIONS = [
  { value: "dsa", label: "DSA Interview" },
  { value: "hr", label: "HR Interview" },
  { value: "system-design", label: "System Design" },
];

const DIFFICULTY_OPTIONS = ["easy", "medium", "hard"];

function normalizeFeedback(feedback) {
  if (!feedback) return [];
  return [
    ["Correctness", feedback.correctness],
    ["Clarity", feedback.clarity],
    ["Optimization", feedback.optimization],
    ["Communication", feedback.communication],
    ["Overall", feedback.overall],
  ].filter(([, value]) => String(value || "").trim().length > 0);
}

export function MockInterview() {
  const [type, setType] = useState("dsa");
  const [difficulty, setDifficulty] = useState("medium");
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [error, setError] = useState("");

  const [session, setSession] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answerText, setAnswerText] = useState("");
  const [code, setCode] = useState(
    "function solve(input) {\n  // write your answer\n}\n",
  );
  const [evaluation, setEvaluation] = useState(null);

  const [history, setHistory] = useState([]);
  const [performance, setPerformance] = useState([]);
  const [stats, setStats] = useState({
    averageScore: 0,
    bestScore: 0,
    total: 0,
  });

  const isCodingQuestion = currentQuestion?.type === "coding";

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const [historyData, perfData] = await Promise.all([
        api.get("/interview/history"),
        api.get("/interview/performance"),
      ]);
      setHistory(historyData?.history || []);
      setPerformance(perfData?.graph || []);
      setStats(perfData?.stats || { averageScore: 0, bestScore: 0, total: 0 });
    } catch (err) {
      setError(err?.message || "Failed to load interview history");
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const startInterview = async () => {
    setStarting(true);
    setError("");
    setEvaluation(null);
    setAnswerText("");
    setCode("function solve(input) {\n  // write your answer\n}\n");
    try {
      const data = await api.post("/interview/start", { type, difficulty });
      setSession({
        sessionId: data.sessionId,
        totalQuestions: data.totalQuestions,
        currentQuestionIndex: data.currentQuestionIndex,
        status: "in-progress",
      });
      setCurrentQuestion(data.question);
    } catch (err) {
      setError(err?.message || "Unable to start interview session");
    } finally {
      setStarting(false);
    }
  };

  const submitAnswer = async () => {
    if (!session?.sessionId || !currentQuestion?.questionId) return;
    if (!answerText.trim() && !code.trim()) {
      setError("Please provide an answer before submitting.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const payload = {
        sessionId: session.sessionId,
        questionId: currentQuestion.questionId,
        answerText,
        code: isCodingQuestion ? code : "",
        language: "javascript",
      };

      const data = await api.post("/interview/answer", payload);
      setEvaluation(data.evaluation);

      setSession((prev) => ({
        ...prev,
        status: data.status,
        currentQuestionIndex: data.currentQuestionIndex,
        score: data.score,
        completed: data.completed,
      }));

      if (data.nextQuestion) {
        setCurrentQuestion(data.nextQuestion);
        setAnswerText("");
        if (data.nextQuestion.type === "coding") {
          setCode("function solve(input) {\n  // write your answer\n}\n");
        }
      } else {
        setCurrentQuestion(null);
        await fetchHistory();
      }
    } catch (err) {
      setError(err?.message || "Failed to submit answer");
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit = useMemo(
    () => Boolean(answerText.trim() || code.trim()),
    [answerText, code],
  );

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white flex items-center gap-3 tracking-tight">
            <BrainCircuit className="text-cyan-400" size={36} /> Virtual Mock
            Interview
          </h1>
          <p className="text-slate-400 mt-1">
            AI-powered interview practice with scoring, feedback, and progress
            tracking.
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {!session || session?.completed ? (
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 space-y-5">
              <h2 className="text-xl font-black text-white">
                Start Mock Interview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
                    Interview Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                  >
                    {TYPE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 uppercase tracking-widest font-bold mb-2">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value)}
                    className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-white"
                  >
                    {DIFFICULTY_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={startInterview}
                disabled={starting}
                className="w-full rounded-xl py-3 bg-gradient-to-r from-cyan-500 to-purple-600 text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {starting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Starting...
                  </>
                ) : (
                  <>
                    <Play size={20} /> Start Mock Interview
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                    Question {Number(session?.currentQuestionIndex || 0) + 1} /{" "}
                    {session?.totalQuestions || 3}
                  </div>
                  <h3 className="text-white font-bold text-lg leading-relaxed">
                    {currentQuestion?.prompt ||
                      "Interview complete. Check your result in history."}
                  </h3>
                </div>
                <div className="w-56 shrink-0">
                  <Timer
                    duration={15 * 60}
                    running={session?.status === "in-progress"}
                  />
                </div>
              </div>

              <textarea
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder={
                  currentQuestion?.type === "hr"
                    ? "Type your HR response here (or use voice input in future enhancement)..."
                    : "Explain your approach, assumptions, and trade-offs..."
                }
                className="w-full h-32 rounded-2xl border border-white/10 bg-slate-950/80 p-4 text-slate-100"
              />

              {isCodingQuestion && (
                <div className="rounded-2xl overflow-hidden border border-white/10">
                  <Editor
                    height="320px"
                    theme="vs-dark"
                    language="javascript"
                    value={code}
                    onChange={(value) => setCode(value || "")}
                    options={{ minimap: { enabled: false }, fontSize: 14 }}
                  />
                </div>
              )}

              {currentQuestion?.type === "hr" && (
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  <Mic size={14} /> Voice-based HR interview can be layered via
                  browser speech-to-text API.
                </div>
              )}

              <button
                onClick={submitAnswer}
                disabled={submitting || !canSubmit || !currentQuestion}
                className="w-full rounded-xl py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-black flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="animate-spin" size={20} /> Evaluating...
                  </>
                ) : (
                  <>
                    <Send size={18} /> Submit Answer
                  </>
                )}
              </button>

              {evaluation && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4 space-y-3"
                >
                  <div className="text-cyan-300 font-black text-lg">
                    Score: {Number(evaluation?.score || 0)} / 100
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {normalizeFeedback(evaluation.feedback).map(
                      ([title, value]) => (
                        <div
                          key={title}
                          className="rounded-xl bg-slate-950/70 p-3 border border-white/10"
                        >
                          <div className="text-xs text-slate-400 uppercase tracking-widest font-bold mb-1">
                            {title}
                          </div>
                          <p className="text-sm text-slate-200">{value}</p>
                        </div>
                      ),
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

          {!!error && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-300 text-sm font-semibold">
              {error}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-white font-black mb-3 flex items-center gap-2">
              <BarChart3 size={18} className="text-cyan-400" /> Performance
              Graph
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performance}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="index" stroke="#94a3b8" />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#22d3ee"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3 text-center">
              <div className="rounded-lg bg-slate-950/60 p-2">
                <div className="text-xs text-slate-400">Total</div>
                <div className="text-white font-black">{stats.total}</div>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2">
                <div className="text-xs text-slate-400">Avg</div>
                <div className="text-white font-black">
                  {stats.averageScore}
                </div>
              </div>
              <div className="rounded-lg bg-slate-950/60 p-2">
                <div className="text-xs text-slate-400">Best</div>
                <div className="text-white font-black">{stats.bestScore}</div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-slate-900/50 p-5">
            <h3 className="text-white font-black mb-3">Interview History</h3>
            {loadingHistory ? (
              <div className="text-slate-500 text-sm">Loading history...</div>
            ) : history.length === 0 ? (
              <div className="text-slate-500 text-sm">No sessions yet.</div>
            ) : (
              <div className="space-y-2 max-h-80 overflow-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-xl border border-white/10 bg-slate-950/60 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-wide text-cyan-300 font-bold">
                        {item.type} • {item.difficulty}
                      </span>
                      <span className="text-white font-black text-sm">
                        {item.score}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(item.createdAt).toLocaleString()} •{" "}
                      {item.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
