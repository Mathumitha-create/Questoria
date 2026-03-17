import React, { useEffect, useState } from "react";
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Play,
  Send,
  ChevronRight,
  ChevronLeft,
  Lightbulb,
  BookOpen,
  MessageCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Cpu,
  Star,
  Zap,
  AlignLeft,
  Settings2,
  RefreshCcw,
  Terminal,
  Loader2,
} from "lucide-react";
import { cn } from "../lib/utils";
import confetti from "canvas-confetti";
import { api } from "../lib/api";

const LANGUAGES = [
  {
    id: 63,
    name: "JavaScript",
    monaco: "javascript",
    template:
      "/**\n * @param {number[]} nums\n * @param {number} target\n * @return {number[]}\n */\nvar twoSum = function(nums, target) {\n  // Your solution here\n  \n};\n",
  },
  {
    id: 71,
    name: "Python",
    monaco: "python",
    template:
      "class Solution:\n    def twoSum(self, nums: list[int], target: int) -> list[int]:\n        # Your solution here\n        pass\n",
  },
  {
    id: 54,
    name: "C++",
    monaco: "cpp",
    template:
      "class Solution {\npublic:\n    vector<int> twoSum(vector<int>& nums, int target) {\n        // Your solution here\n        \n    }\n};\n",
  },
  {
    id: 62,
    name: "Java",
    monaco: "java",
    template:
      "class Solution {\n    public int[] twoSum(int[] nums, int target) {\n        // Your solution here\n        \n    }\n}\n",
  },
];

const PROBLEM_DATA = {
  1: {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    description: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
        explanation: "Because nums[1] + nums[2] == 6, we return [1, 2].",
      },
    ],
    constraints: [
      "2 ≤ nums.length ≤ 10⁴",
      "-10⁹ ≤ nums[i] ≤ 10⁹",
      "-10⁹ ≤ target ≤ 10⁹",
      "Only one valid answer exists.",
    ],
    hints: [
      "Try using a hash map to store visited numbers.",
      "For each number, check if target - number exists in the map.",
    ],
    testCases: [
      { input: "[2,7,11,15]\n9", expected: "[0,1]" },
      { input: "[3,2,4]\n6", expected: "[1,2]" },
      { input: "[3,3]\n6", expected: "[0,1]" },
    ],
    xpReward: 100,
    tags: ["Arrays", "Math"],
    acceptance: 49.2,
    submissions: "12.5M",
    editorial: `## Approach: Hash Map\n\n**Intuition**: While iterating through the array, store each element in a hash map. For each element x, check if target - x already exists in the map.\n\n**Time Complexity**: O(n)\n**Space Complexity**: O(n)\n\n\`\`\`javascript\nvar twoSum = function(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) return [map.get(complement), i];\n    map.set(nums[i], i);\n  }\n};\n\`\`\``,
  },
};

const DEFAULT_PROBLEM = PROBLEM_DATA[1];

const TABS = ["Description", "Editorial", "Discussion", "Submissions"];

function DiscussionSection() {
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([
    {
      id: 1,
      author: "CyberKnight",
      text: "Great problem! Hash map approach makes it O(n).",
      upvotes: 42,
      time: "2h ago",
    },
    {
      id: 2,
      author: "NeonGhost",
      text: "Neat trick: you can do this in one pass!",
      upvotes: 28,
      time: "5h ago",
    },
  ]);

  const addComment = () => {
    if (!comment.trim()) return;
    setComments((prev) => [
      ...prev,
      {
        id: Date.now(),
        author: "You",
        text: comment,
        upvotes: 0,
        time: "Just now",
      },
    ]);
    setComment("");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addComment()}
          placeholder="Share your approach or ask a question..."
          className="flex-1 bg-slate-950 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
        />
        <button
          onClick={addComment}
          className="px-4 py-2.5 bg-cyan-500 text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all"
        >
          Post
        </button>
      </div>
      <div className="space-y-3">
        {comments.map((c) => (
          <div
            key={c.id}
            className="bg-slate-900/60 rounded-2xl p-4 border border-white/5"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-cyan-400 font-black text-sm">
                {c.author}
              </span>
              <span className="text-slate-600 text-xs">{c.time}</span>
            </div>
            <p className="text-slate-300 text-sm">{c.text}</p>
            <button className="mt-2 text-slate-600 text-xs font-bold hover:text-cyan-400 transition-colors flex items-center gap-1">
              ▲ {c.upvotes}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProblemDetail({ problem = DEFAULT_PROBLEM, onBack }) {
  const [activeTab, setActiveTab] = useState("Description");
  const [lang, setLang] = useState(LANGUAGES[0]);
  const [code, setCode] = useState(LANGUAGES[0].template);
  const [output, setOutput] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customInput, setCustomInput] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [hintsRevealed, setHintsRevealed] = useState([]);
  const [results, setResults] = useState(null);
  const [serverProblem, setServerProblem] = useState(null);
  const [submissions, setSubmissions] = useState([]);

  const problemId = problem?._id || problem?.id;

  useEffect(() => {
    if (!problemId) return;
    let mounted = true;

    const load = async () => {
      try {
        const [{ problem: fetched }, { submissions: fetchedSubs = [] }] =
          await Promise.all([
            api.get(`/problems/${problemId}`),
            api.get(`/problems/${problemId}/submissions/me`),
          ]);
        if (!mounted) return;
        setServerProblem(fetched);
        setSubmissions(fetchedSubs);
      } catch {
        if (!mounted) return;
        setServerProblem(null);
        setSubmissions([]);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [problemId]);

  const problemData = serverProblem ||
    PROBLEM_DATA[problem.id] || {
      ...problem,
      examples: [],
      constraints: [],
      hints: [],
      testCases: [],
      editorial: "",
    };

  const switchLang = (l) => {
    setLang(l);
    setCode(l.template);
    setOutput(null);
    setResults(null);
  };

  const runCode = async () => {
    setIsRunning(true);
    setOutput(null);
    setResults(null);
    try {
      const language =
        lang.monaco === "javascript" ? "javascript" : lang.monaco;

      const data = await api.post(`/problems/${problemId}/run`, {
        language,
        sourceCode: code,
        stdin: customInput,
      });

      setOutput({
        stdout: data.output || "",
        stderr: data.error || "",
        time: data.runtime,
        memory: data.memory,
        status: data.status,
      });
    } catch {
      setOutput({
        stdout: "",
        stderr: "Network error: Could not reach judge server.",
        status: "Error",
      });
    } finally {
      setIsRunning(false);
    }
  };

  const submitSolution = async () => {
    setIsSubmitting(true);
    try {
      const language =
        lang.monaco === "javascript" ? "javascript" : lang.monaco;

      const { submission } = await api.post(`/problems/${problemId}/submit`, {
        language,
        sourceCode: code,
        contestId: problem?.contestId || null,
      });

      const passed = !!submission?.passed;
      setResults({
        status: submission?.status || "Pending",
        passed: passed ? 1 : 0,
        total: 1,
        runtime: submission?.runtime || "-",
        memory: submission?.memory || "-",
        percentile: passed ? "Top performer" : null,
      });

      const { submissions: refreshedSubs = [] } = await api.get(
        `/problems/${problemId}/submissions/me`,
      );
      setSubmissions(refreshedSubs);

      if (passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.5 },
          colors: ["#00f2ff", "#7000ff", "#ff00e1"],
        });
      }
    } catch {
      setResults({
        status: "Submission Failed",
        passed: 0,
        total: 1,
        runtime: "-",
        memory: "-",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-0 -mx-8 -my-12 px-4 py-4">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-3 px-2">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
          >
            <ArrowLeft size={16} /> Problems
          </button>
          <div className="h-4 w-px bg-white/10" />
          <h2 className="text-white font-black">{problem.title}</h2>
          <span
            className={cn(
              "text-xs font-black px-2.5 py-1 rounded-full",
              problem.difficulty === "Easy"
                ? "text-emerald-400 bg-emerald-400/10"
                : problem.difficulty === "Medium"
                  ? "text-yellow-400 bg-yellow-400/10"
                  : "text-red-400 bg-red-400/10",
            )}
          >
            {problem.difficulty}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-cyan-400 text-sm font-black">
            <Zap size={14} /> +{problemData.xpReward || 100} XP
          </div>
        </div>
      </div>

      {/* Main split layout */}
      <div className="flex-1 grid grid-cols-2 gap-3 min-h-0">
        {/* Left: Problem details */}
        <div className="flex flex-col bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-white/5 bg-slate-950/50">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  "px-5 py-3 text-xs font-black uppercase tracking-wider transition-all border-b-2",
                  activeTab === tab
                    ? "text-cyan-400 border-cyan-400"
                    : "text-slate-500 border-transparent hover:text-white",
                )}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
            {activeTab === "Description" && (
              <>
                <div className="prose prose-invert prose-sm max-w-none">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">
                    {problemData.description}
                  </p>
                </div>

                {problemData.examples?.map((ex, i) => {
                  const example =
                    typeof ex === "string"
                      ? {
                          input: ex,
                          output: "",
                          explanation: "",
                        }
                      : ex;

                  return (
                    <div
                      key={i}
                      className="bg-slate-950/60 rounded-xl p-4 border border-white/5"
                    >
                      <div className="text-xs font-black text-slate-500 uppercase mb-2">
                        Example {i + 1}
                      </div>
                      <div className="space-y-1 font-mono text-sm">
                        <div>
                          <span className="text-slate-500">Input: </span>
                          <span className="text-cyan-300">{example.input}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Output: </span>
                          <span className="text-emerald-300">
                            {example.output}
                          </span>
                        </div>
                        {example.explanation && (
                          <div>
                            <span className="text-slate-500">
                              Explanation:{" "}
                            </span>
                            <span className="text-slate-300">
                              {example.explanation}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

                {problemData.constraints?.length > 0 && (
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase mb-2">
                      Constraints
                    </div>
                    <ul className="space-y-1">
                      {problemData.constraints.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-slate-400 flex items-start gap-2"
                        >
                          <span className="text-cyan-500 mt-1">•</span>{" "}
                          <code className="text-cyan-300/80">{c}</code>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {problemData.hints?.length > 0 && (
                  <div>
                    <button
                      onClick={() => setShowHints(!showHints)}
                      className="flex items-center gap-2 text-yellow-400 font-black text-sm hover:text-yellow-300 transition-colors"
                    >
                      <Lightbulb size={16} /> {showHints ? "Hide" : "Show"}{" "}
                      Hints
                    </button>
                    <AnimatePresence>
                      {showHints && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden mt-3 space-y-2"
                        >
                          {problemData.hints.map((hint, i) => (
                            <div key={i}>
                              {hintsRevealed.includes(i) ? (
                                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-3 text-yellow-200 text-sm">
                                  {hint}
                                </div>
                              ) : (
                                <button
                                  onClick={() =>
                                    setHintsRevealed((prev) => [...prev, i])
                                  }
                                  className="w-full text-left bg-slate-950 border border-white/5 rounded-xl p-3 text-slate-600 text-sm hover:border-yellow-500/30 transition-all"
                                >
                                  Hint {i + 1} — click to reveal
                                </button>
                              )}
                            </div>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </>
            )}

            {activeTab === "Editorial" && (
              <div className="prose prose-invert prose-sm max-w-none">
                <pre className="text-slate-300 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  {problemData.editorial || "Editorial coming soon..."}
                </pre>
              </div>
            )}

            {activeTab === "Discussion" && <DiscussionSection />}

            {activeTab === "Submissions" && (
              <div className="space-y-3">
                {submissions.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-8">
                    Your past submissions will appear here.
                  </div>
                ) : (
                  submissions.map((s) => (
                    <div
                      key={s._id}
                      className="rounded-xl border border-white/5 bg-slate-950/50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-black px-2 py-1 rounded-full ${s.passed ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}
                        >
                          {s.status}
                        </span>
                        <span className="text-xs text-slate-500">
                          {new Date(s.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-2 text-xs text-slate-400 uppercase">
                        {s.language} • Runtime {s.runtime || "-"} • Memory{" "}
                        {s.memory || "-"}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right: Editor */}
        <div className="flex flex-col bg-slate-900/50 border border-white/5 rounded-2xl overflow-hidden">
          {/* Editor toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-950/80 border-b border-white/5">
            <div className="flex items-center gap-2">
              {LANGUAGES.map((l) => (
                <button
                  key={l.id}
                  onClick={() => switchLang(l)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-black transition-all",
                    lang.id === l.id
                      ? "bg-cyan-500 text-slate-950"
                      : "text-slate-500 hover:text-white",
                  )}
                >
                  {l.name}
                </button>
              ))}
            </div>
            <button
              onClick={() => {
                setCode(lang.template);
                setOutput(null);
                setResults(null);
              }}
              className="p-1.5 text-slate-600 hover:text-white transition-colors"
            >
              <RefreshCcw size={14} />
            </button>
          </div>

          {/* Monaco Editor */}
          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={lang.monaco}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{
                fontSize: 13,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                padding: { top: 12 },
                lineNumbers: "on",
                roundedSelection: true,
              }}
            />
          </div>

          {/* Custom input */}
          <div className="border-t border-white/5 px-4 py-2">
            <div className="text-xs font-black text-slate-600 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
              <Terminal size={10} /> Custom Input
            </div>
            <textarea
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Optional custom test input..."
              className="w-full h-16 bg-slate-950 border border-white/5 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono placeholder:text-slate-700 focus:outline-none focus:border-cyan-500/30 resize-none transition-all"
            />
          </div>

          {/* Output */}
          <AnimatePresence>
            {(output || results) && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden border-t border-white/5"
              >
                <div className="px-4 py-3 bg-slate-950/80 max-h-40 overflow-y-auto">
                  {results && (
                    <div
                      className={cn(
                        "flex items-center gap-2 mb-2 font-black text-sm",
                        results.status === "Accepted"
                          ? "text-emerald-400"
                          : "text-red-400",
                      )}
                    >
                      {results.status === "Accepted" ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <XCircle size={16} />
                      )}
                      {results.status} — {results.passed}/{results.total} test
                      cases passed
                      {results.percentile && (
                        <span className="text-slate-500 font-bold text-xs ml-2">
                          Beats {results.percentile} of users
                        </span>
                      )}
                    </div>
                  )}
                  {output && (
                    <div className="space-y-1 font-mono text-xs">
                      {output.stdout && (
                        <div className="text-cyan-400">{output.stdout}</div>
                      )}
                      {output.stderr && (
                        <div className="text-red-400">{output.stderr}</div>
                      )}
                      {output.time && (
                        <div className="text-slate-600 flex gap-4 mt-1">
                          <span>
                            <Clock size={10} className="inline mr-1" />
                            {output.time}s
                          </span>
                          <span>
                            <Cpu size={10} className="inline mr-1" />
                            {output.memory}KB
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Action buttons */}
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-950/80 border-t border-white/5">
            <button
              onClick={runCode}
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2.5 bg-slate-800 text-white font-black rounded-xl hover:bg-slate-700 transition-all disabled:opacity-50 text-sm"
            >
              {isRunning ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Play size={16} fill="currentColor" />
              )}
              Run
            </button>
            <button
              onClick={submitSolution}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 text-sm"
            >
              {isSubmitting ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} />
              )}
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
