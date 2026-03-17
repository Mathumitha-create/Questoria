import React, { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Code2,
  Filter,
  Search,
  CheckCircle2,
  Circle,
  ChevronRight,
  Star,
  Tag,
  Building2,
  Zap,
  Clock,
  BarChart2,
  BookOpen,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const DIFFICULTIES = ["All", "Easy", "Medium", "Hard"];
const TAGS = [
  "All",
  "Arrays",
  "Dynamic Programming",
  "Graph",
  "Trees",
  "Strings",
  "Math",
  "Sorting",
  "Binary Search",
  "Recursion",
];
const COMPANIES = [
  "All",
  "Google",
  "Amazon",
  "Microsoft",
  "Meta",
  "Apple",
  "Netflix",
];

const PROBLEMS = [
  {
    id: 1,
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Arrays", "Math"],
    acceptance: 49.2,
    company: "Amazon",
    solved: true,
    attempts: 1,
  },
  {
    id: 2,
    title: "Longest Substring Without Repeating Characters",
    difficulty: "Medium",
    tags: ["Strings", "Sliding Window"],
    acceptance: 33.8,
    company: "Google",
    solved: false,
    attempts: 0,
  },
  {
    id: 3,
    title: "Median of Two Sorted Arrays",
    difficulty: "Hard",
    tags: ["Arrays", "Binary Search"],
    acceptance: 36.1,
    company: "Google",
    solved: false,
    attempts: 2,
  },
  {
    id: 4,
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["Strings", "Stack"],
    acceptance: 40.9,
    company: "Meta",
    solved: true,
    attempts: 1,
  },
  {
    id: 5,
    title: "Merge Two Sorted Lists",
    difficulty: "Easy",
    tags: ["Recursion"],
    acceptance: 62.5,
    company: "Amazon",
    solved: true,
    attempts: 1,
  },
  {
    id: 6,
    title: "Maximum Subarray",
    difficulty: "Medium",
    tags: ["Dynamic Programming", "Arrays"],
    acceptance: 50.2,
    company: "Microsoft",
    solved: false,
    attempts: 3,
  },
  {
    id: 7,
    title: "Binary Tree Level Order Traversal",
    difficulty: "Medium",
    tags: ["Trees", "Graph"],
    acceptance: 64.7,
    company: "Google",
    solved: false,
    attempts: 0,
  },
  {
    id: 8,
    title: "Word Ladder",
    difficulty: "Hard",
    tags: ["Graph", "Strings", "Binary Search"],
    acceptance: 35.3,
    company: "Meta",
    solved: false,
    attempts: 0,
  },
  {
    id: 9,
    title: "Coin Change",
    difficulty: "Medium",
    tags: ["Dynamic Programming", "Math"],
    acceptance: 41.8,
    company: "Amazon",
    solved: false,
    attempts: 1,
  },
  {
    id: 10,
    title: "Trapping Rain Water",
    difficulty: "Hard",
    tags: ["Arrays", "Dynamic Programming"],
    acceptance: 58.9,
    company: "Netflix",
    solved: false,
    attempts: 0,
  },
  {
    id: 11,
    title: "Climbing Stairs",
    difficulty: "Easy",
    tags: ["Dynamic Programming", "Math"],
    acceptance: 51.7,
    company: "Apple",
    solved: true,
    attempts: 1,
  },
  {
    id: 12,
    title: "Rotate Image",
    difficulty: "Medium",
    tags: ["Arrays", "Math"],
    acceptance: 72.3,
    company: "Microsoft",
    solved: false,
    attempts: 0,
  },
];

const DIFF_COLORS = {
  Easy: "text-emerald-400 bg-emerald-400/10",
  Medium: "text-yellow-400 bg-yellow-400/10",
  Hard: "text-red-400 bg-red-400/10",
};

export function Problems({ onSelectProblem }) {
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [tag, setTag] = useState("All");
  const [company, setCompany] = useState("All");
  const [showFilters, setShowFilters] = useState(false);
  const [problems, setProblems] = useState([]);
  const [progressByProblem, setProgressByProblem] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    api
      .get("/problems/progress/me")
      .then(({ progress = {} }) => {
        if (!mounted) return;
        setProgressByProblem(progress);
      })
      .catch(() => {
        if (!mounted) return;
        setProgressByProblem({});
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadProblems = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.set("search", search);
        if (difficulty !== "All") params.set("difficulty", difficulty);
        if (tag !== "All") params.set("tag", tag);
        if (company !== "All") params.set("company", company);

        const query = params.toString();
        const { problems: data = [] } = await api.get(
          `/problems${query ? `?${query}` : ""}`,
        );
        if (!mounted) return;
        setProblems(data);
      } catch {
        if (!mounted) return;
        setProblems([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    const timeout = setTimeout(loadProblems, 200);
    return () => {
      mounted = false;
      clearTimeout(timeout);
    };
  }, [search, difficulty, tag, company]);

  const filtered = useMemo(
    () =>
      problems.map((p) => {
        const id = p._id || p.id;
        const progress = progressByProblem[id] || {
          solved: false,
          attempts: 0,
        };
        return {
          ...p,
          solved: !!progress.solved,
          attempts: progress.attempts || 0,
        };
      }),
    [problems, progressByProblem],
  );

  const solved = filtered.filter((p) => p.solved).length;

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
            <Code2 className="text-cyan-400" size={36} /> PROBLEM ARENA
          </h1>
          <p className="text-slate-400">
            Sharpen your skills, conquer challenges, earn XP.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-2 text-center">
            <div className="text-2xl font-black text-white">
              {solved}/{problems.length}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Solved
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-2 text-center">
            <div className="text-2xl font-black text-emerald-400">
              {
                problems.filter((p) => p.difficulty === "Easy" && p.solved)
                  .length
              }
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Easy
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-2 text-center">
            <div className="text-2xl font-black text-yellow-400">
              {
                problems.filter((p) => p.difficulty === "Medium" && p.solved)
                  .length
              }
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Medium
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-2 text-center">
            <div className="text-2xl font-black text-red-400">
              {
                problems.filter((p) => p.difficulty === "Hard" && p.solved)
                  .length
              }
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">
              Hard
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search problems..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50 transition-all"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-2 px-5 py-3 rounded-xl border font-bold text-sm transition-all",
            showFilters
              ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-400"
              : "bg-slate-900/50 border-white/10 text-slate-400 hover:text-white",
          )}
        >
          <Filter size={16} /> Filters
        </button>
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Zap size={12} />
                  Difficulty
                </div>
                <div className="flex flex-wrap gap-2">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      onClick={() => setDifficulty(d)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-black transition-all",
                        difficulty === d
                          ? "bg-cyan-500 text-slate-950"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Tag size={12} />
                  Topic
                </div>
                <div className="flex flex-wrap gap-2">
                  {TAGS.map((t) => (
                    <button
                      key={t}
                      onClick={() => setTag(t)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-bold transition-all",
                        tag === t
                          ? "bg-purple-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <Building2 size={12} />
                  Company
                </div>
                <div className="flex flex-wrap gap-2">
                  {COMPANIES.map((c) => (
                    <button
                      key={c}
                      onClick={() => setCompany(c)}
                      className={cn(
                        "px-4 py-1.5 rounded-full text-xs font-bold transition-all",
                        company === c
                          ? "bg-pink-500 text-white"
                          : "bg-slate-800 text-slate-400 hover:bg-slate-700",
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Problem Table */}
      <div className="bg-slate-900/40 border border-white/5 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-[2.5rem_1fr_6rem_5rem_6rem_5rem] gap-4 px-6 py-3 bg-slate-950/50 text-xs font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
          <span>#</span>
          <span>Title</span>
          <span>Difficulty</span>
          <span>Acceptance</span>
          <span>Tags</span>
          <span className="text-right">Action</span>
        </div>
        <div className="divide-y divide-white/5">
          {filtered.map((problem, i) => (
            <motion.div
              key={problem._id || problem.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => onSelectProblem && onSelectProblem(problem)}
              className="grid grid-cols-[2.5rem_1fr_6rem_5rem_6rem_5rem] gap-4 px-6 py-4 items-center hover:bg-slate-900/60 cursor-pointer transition-all group"
            >
              <div className="text-slate-600 font-black text-sm">
                {problem.solved ? (
                  <CheckCircle2 size={18} className="text-emerald-500" />
                ) : (
                  <Circle size={18} className="text-slate-700" />
                )}
              </div>
              <div>
                <div className="text-white font-bold group-hover:text-cyan-400 transition-colors text-sm leading-tight">
                  {problem.title}
                </div>
                {problem.attempts > 0 && !problem.solved && (
                  <div className="text-[10px] text-yellow-500 font-bold mt-0.5">
                    {problem.attempts || 0} attempt
                    {(problem.attempts || 0) > 1 ? "s" : ""}
                  </div>
                )}
              </div>
              <div>
                <span
                  className={cn(
                    "text-xs font-black px-2.5 py-1 rounded-full",
                    DIFF_COLORS[problem.difficulty] ||
                      "text-slate-300 bg-slate-700/20",
                  )}
                >
                  {problem.difficulty}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-bold">
                <BarChart2 size={12} />{" "}
                {problem.acceptanceRate || problem.acceptance || 0}%
              </div>
              <div className="flex gap-1 flex-wrap">
                {(problem.tags || []).slice(0, 1).map((tag) => (
                  <span
                    key={tag}
                    className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-bold"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="text-right">
                <button className="text-slate-600 group-hover:text-cyan-400 transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-20 text-slate-600">
          <BookOpen size={48} className="mx-auto mb-4 opacity-30" />
          <div className="font-black text-xl">
            {loading ? "Loading problems..." : "No problems match your filters"}
          </div>
          <div className="text-sm mt-2">Try adjusting your search criteria</div>
        </div>
      )}
    </div>
  );
}
