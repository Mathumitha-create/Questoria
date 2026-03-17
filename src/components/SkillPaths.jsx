import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Map,
  Layers,
  Globe,
  Brain,
  Cpu,
  ChevronRight,
  CheckCircle2,
  Lock,
  Star,
  Zap,
  Award,
  Play,
  BookOpen,
  Code2,
  BarChart2,
  Trophy,
} from "lucide-react";
import { cn } from "../lib/utils";

const PATHS = [
  {
    id: "ds",
    title: "Data Structures",
    icon: Layers,
    color: "text-cyan-400",
    bg: "from-cyan-900/30 to-slate-900/30",
    border: "border-cyan-500/20",
    glow: "rgba(34,211,238,0.15)",
    description: "Master arrays, linked lists, trees, graphs, heaps, and more.",
    totalLevels: 10,
    completedLevels: 3,
    xpReward: 5000,
    badge: "Data Maestro",
    levels: [
      { id: 1, title: "Arrays & Strings", tasks: 8, completed: true, xp: 400 },
      { id: 2, title: "Linked Lists", tasks: 6, completed: true, xp: 350 },
      { id: 3, title: "Stacks & Queues", tasks: 7, completed: true, xp: 400 },
      { id: 4, title: "Hash Maps", tasks: 5, completed: false, xp: 500 },
      { id: 5, title: "Trees & BST", tasks: 10, completed: false, xp: 600 },
      { id: 6, title: "Heaps", tasks: 6, completed: false, xp: 550 },
    ],
  },
  {
    id: "algo",
    title: "Algorithms",
    icon: Brain,
    color: "text-purple-400",
    bg: "from-purple-900/30 to-slate-900/30",
    border: "border-purple-500/20",
    glow: "rgba(168,85,247,0.15)",
    description:
      "Sorting, searching, dynamic programming, greedy, divide & conquer.",
    totalLevels: 12,
    completedLevels: 1,
    xpReward: 7500,
    badge: "Algorithm Sage",
    levels: [
      {
        id: 1,
        title: "Sorting Algorithms",
        tasks: 6,
        completed: true,
        xp: 400,
      },
      { id: 2, title: "Binary Search", tasks: 8, completed: false, xp: 450 },
      { id: 3, title: "Two Pointers", tasks: 7, completed: false, xp: 400 },
      { id: 4, title: "Sliding Window", tasks: 6, completed: false, xp: 500 },
      {
        id: 5,
        title: "Recursion & Backtracking",
        tasks: 9,
        completed: false,
        xp: 600,
      },
      {
        id: 6,
        title: "Dynamic Programming",
        tasks: 15,
        completed: false,
        xp: 1000,
      },
    ],
  },
  {
    id: "web",
    title: "Web Development",
    icon: Globe,
    color: "text-pink-400",
    bg: "from-pink-900/30 to-slate-900/30",
    border: "border-pink-500/20",
    glow: "rgba(236,72,153,0.15)",
    description:
      "HTML, CSS, React, Node.js, REST APIs, and full-stack deployment.",
    totalLevels: 15,
    completedLevels: 5,
    xpReward: 6000,
    badge: "Web Wizard",
    levels: [
      { id: 1, title: "HTML Fundamentals", tasks: 8, completed: true, xp: 200 },
      { id: 2, title: "CSS & Styling", tasks: 10, completed: true, xp: 250 },
      {
        id: 3,
        title: "JavaScript Basics",
        tasks: 12,
        completed: true,
        xp: 400,
      },
      {
        id: 4,
        title: "React Fundamentals",
        tasks: 10,
        completed: true,
        xp: 500,
      },
      { id: 5, title: "State Management", tasks: 8, completed: true, xp: 550 },
      {
        id: 6,
        title: "Node.js & Express",
        tasks: 10,
        completed: false,
        xp: 600,
      },
    ],
  },
  {
    id: "ml",
    title: "Machine Learning",
    icon: Cpu,
    color: "text-amber-400",
    bg: "from-amber-900/30 to-slate-900/30",
    border: "border-amber-500/20",
    glow: "rgba(245,158,11,0.15)",
    description:
      "Linear regression, neural networks, NLP, and model deployment.",
    totalLevels: 10,
    completedLevels: 0,
    xpReward: 10000,
    badge: "ML Engineer",
    levels: [
      { id: 1, title: "Python for ML", tasks: 8, completed: false, xp: 300 },
      {
        id: 2,
        title: "Linear & Logistic Regression",
        tasks: 7,
        completed: false,
        xp: 400,
      },
      {
        id: 3,
        title: "Decision Trees & RF",
        tasks: 6,
        completed: false,
        xp: 450,
      },
      { id: 4, title: "Neural Networks", tasks: 10, completed: false, xp: 700 },
      {
        id: 5,
        title: "CNNs & Image Classification",
        tasks: 8,
        completed: false,
        xp: 800,
      },
      {
        id: 6,
        title: "NLP & Transformers",
        tasks: 9,
        completed: false,
        xp: 1000,
      },
    ],
  },
  {
    id: "system",
    title: "System Design",
    icon: BarChart2,
    color: "text-emerald-400",
    bg: "from-emerald-900/30 to-slate-900/30",
    border: "border-emerald-500/20",
    glow: "rgba(16,185,129,0.15)",
    description:
      "Scalability, databases, caching, load balancing, and micro-services.",
    totalLevels: 8,
    completedLevels: 0,
    xpReward: 8000,
    badge: "Architect",
    levels: [
      {
        id: 1,
        title: "Basics of Scalability",
        tasks: 5,
        completed: false,
        xp: 400,
      },
      {
        id: 2,
        title: "Databases & SQL vs NoSQL",
        tasks: 7,
        completed: false,
        xp: 500,
      },
      {
        id: 3,
        title: "Caching Strategies",
        tasks: 5,
        completed: false,
        xp: 450,
      },
      {
        id: 4,
        title: "Load Balancers & CDN",
        tasks: 5,
        completed: false,
        xp: 500,
      },
      { id: 5, title: "Message Queues", tasks: 4, completed: false, xp: 600 },
      {
        id: 6,
        title: "Design Real Systems",
        tasks: 8,
        completed: false,
        xp: 800,
      },
    ],
  },
];

function PathCard({ path, onSelect }) {
  const pct = Math.round((path.completedLevels / path.totalLevels) * 100);
  return (
    <motion.div
      whileHover={{ y: -4 }}
      onClick={() => onSelect(path)}
      className={cn(
        "cursor-pointer bg-gradient-to-br rounded-3xl p-6 border hover:shadow-[0_0_30px_var(--glow)] transition-all group relative overflow-hidden",
        path.bg,
        path.border,
      )}
      style={{ "--glow": path.glow }}
    >
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/3 group-hover:scale-150 transition-transform duration-700 origin-center" />
      <div
        className={cn(
          "w-14 h-14 rounded-2xl bg-slate-900/60 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform",
        )}
      >
        <path.icon size={28} className={path.color} />
      </div>
      <h3 className="text-xl font-black text-white mb-1">{path.title}</h3>
      <p className="text-slate-500 text-sm mb-5 leading-relaxed">
        {path.description}
      </p>
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500 font-bold">
            {path.completedLevels}/{path.totalLevels} Levels
          </span>
          <span className={cn("font-black", path.color)}>{pct}%</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 1, delay: 0.3 }}
            className={cn(
              "h-full rounded-full",
              path.color.replace("text-", "bg-"),
            )}
          />
        </div>
      </div>
      <div className="mt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-sm font-black text-slate-400">
          <Zap size={14} className={path.color} />+
          {path.xpReward.toLocaleString()} XP
        </div>
        <div className="flex items-center gap-1 text-slate-600 group-hover:text-cyan-400 font-black text-sm transition-colors">
          Explore <ChevronRight size={16} />
        </div>
      </div>
    </motion.div>
  );
}

function PathDetail({ path, onBack }) {
  return (
    <div className="space-y-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
      >
        <ChevronRight size={16} className="rotate-180" /> All Paths
      </button>

      <div
        className={cn(
          "bg-gradient-to-br rounded-3xl p-8 border relative overflow-hidden",
          path.bg,
          path.border,
        )}
      >
        <div className="flex items-start justify-between">
          <div>
            <div
              className={cn(
                "w-16 h-16 rounded-2xl bg-slate-900/60 flex items-center justify-center mb-4",
              )}
            >
              <path.icon size={32} className={path.color} />
            </div>
            <h1 className="text-4xl font-black text-white mb-2">
              {path.title}
            </h1>
            <p className="text-slate-400 max-w-xl mb-6">{path.description}</p>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-black text-white">
                  {path.totalLevels}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold">
                  Levels
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-black text-white">
                  {path.completedLevels}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold">
                  Done
                </div>
              </div>
              <div className="text-center">
                <div className={cn("text-2xl font-black", path.color)}>
                  {path.xpReward.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 uppercase font-bold">
                  XP Reward
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-1">
                <Award size={16} className={path.color} />
                <span className="text-white font-black text-sm">
                  {path.badge}
                </span>
              </div>
              <div className="text-slate-500 text-xs">Badge on completion</div>
            </div>
          </div>
        </div>
      </div>

      {/* Level map */}
      <div className="space-y-3">
        <h2 className="text-xl font-black text-white">Learning Path</h2>
        {path.levels.map((level, i) => {
          const prevDone = i === 0 || path.levels[i - 1].completed;
          const locked = !prevDone && !level.completed;
          return (
            <motion.div
              key={level.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className={cn(
                "flex items-center gap-5 p-5 rounded-2xl border transition-all",
                level.completed
                  ? "bg-emerald-500/10 border-emerald-500/20"
                  : locked
                    ? "bg-slate-900/30 border-white/5 opacity-60"
                    : "bg-slate-900/50 border-white/10 hover:border-white/20 cursor-pointer hover:bg-slate-900/70",
              )}
            >
              <div
                className={cn(
                  "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0",
                  level.completed
                    ? "bg-emerald-500/20 text-emerald-400"
                    : locked
                      ? "bg-slate-800 text-slate-600"
                      : "bg-slate-800 text-white",
                )}
              >
                {level.completed ? (
                  <CheckCircle2 size={22} className="text-emerald-400" />
                ) : locked ? (
                  <Lock size={20} />
                ) : (
                  level.id
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3
                    className={cn(
                      "font-black",
                      level.completed
                        ? "text-emerald-300"
                        : locked
                          ? "text-slate-600"
                          : "text-white",
                    )}
                  >
                    Level {level.id}: {level.title}
                  </h3>
                </div>
                <div className="text-slate-500 text-xs font-bold">
                  {level.tasks} tasks
                </div>
              </div>
              <div
                className={cn(
                  "font-black text-sm flex items-center gap-1",
                  level.completed ? "text-emerald-400" : "text-slate-500",
                )}
              >
                <Zap size={14} />+{level.xp} XP
              </div>
              {!locked && !level.completed && (
                <button className="px-5 py-2 bg-cyan-500 text-slate-950 rounded-xl font-black text-sm hover:bg-cyan-400 transition-all flex items-center gap-2">
                  <Play size={14} fill="currentColor" /> Start
                </button>
              )}
              {level.completed && (
                <span className="text-emerald-500 text-xs font-black uppercase bg-emerald-500/10 px-3 py-1.5 rounded-full">
                  Done
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function SkillPaths() {
  const [selectedPath, setSelectedPath] = useState(null);

  if (selectedPath) {
    return (
      <PathDetail path={selectedPath} onBack={() => setSelectedPath(null)} />
    );
  }

  const totalXP = PATHS.reduce(
    (a, p) => a + Math.round((p.xpReward * p.completedLevels) / p.totalLevels),
    0,
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
            <Map className="text-purple-400" size={36} /> SKILL PATHS
          </h1>
          <p className="text-slate-400">
            Structured learning tracks to level up your career.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3 text-center">
            <div className="text-xl font-black text-purple-400">
              {totalXP.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">
              XP Earned
            </div>
          </div>
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-5 py-3 text-center">
            <div className="text-xl font-black text-cyan-400">
              {PATHS.reduce((a, p) => a + p.completedLevels, 0)}
            </div>
            <div className="text-[10px] text-slate-500 uppercase font-bold">
              Levels Done
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PATHS.map((path, i) => (
          <motion.div
            key={path.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
          >
            <PathCard path={path} onSelect={setSelectedPath} />
          </motion.div>
        ))}
      </div>

      <div className="bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-white/10 rounded-3xl p-8 text-center">
        <Trophy size={48} className="text-yellow-400 mx-auto mb-4" />
        <h2 className="text-2xl font-black text-white mb-2">
          Complete All Paths
        </h2>
        <p className="text-slate-400 mb-6 max-w-md mx-auto">
          Finish all 5 skill paths to earn the legendary{" "}
          <span className="text-cyan-400 font-black">
            "Master of Questoria"
          </span>{" "}
          badge and unlock exclusive content.
        </p>
        <div className="flex items-center justify-center gap-3 flex-wrap">
          {PATHS.map((p) => (
            <div
              key={p.id}
              className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center border",
                p.completedLevels === p.totalLevels
                  ? p.border + " bg-slate-800"
                  : "border-white/5 bg-slate-900/50",
              )}
            >
              <p.icon
                size={18}
                className={
                  p.completedLevels === p.totalLevels
                    ? p.color
                    : "text-slate-700"
                }
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
