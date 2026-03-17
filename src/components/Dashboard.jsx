import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Zap,
  Target,
  Flame,
  Award,
  ChevronRight,
  Code,
  Trophy,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../AuthContext";
import { api } from "../lib/api";

function StatCard({ label, value, icon: Icon, color, progress }) {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
            className={cn("h-full rounded-full", color)}
          />
        </div>
      )}
    </div>
  );
}

export function Dashboard({ setActiveTab }) {
  const { profile } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    let mounted = true;
    api
      .get("/user/stats")
      .then((data) => {
        if (!mounted) return;
        setStats(data);
      })
      .catch(() => {
        if (!mounted) return;
        setStats(null);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const name = profile?.displayName || "Adventurer";
  const level = stats?.level ?? profile?.level ?? 1;
  const xp = stats?.xp ?? profile?.xp ?? 0;
  const streak = stats?.streak ?? profile?.streak ?? 0;
  const coins = profile?.coins || 0;
  const badges = stats?.badges?.length ?? profile?.badges?.length ?? 0;
  const problemsSolved = stats?.problemsSolved ?? profile?.problemsSolved ?? 0;
  const contestRating = stats?.contestRating ?? profile?.contestRating ?? 1200;
  const rank = stats?.rank ?? profile?.rank ?? "—";
  const recentSubmissions = stats?.recentSubmissions || [];
  const xpToNext = level * 1000;
  const xpProgress = Math.min(((xp % xpToNext) / xpToNext) * 100, 100);
  const RANK_TITLES = [
    "Novice",
    "Apprentice",
    "Explorer",
    "Knight",
    "Warrior",
    "Hero",
    "Master",
    "Champion",
    "Legend",
    "Grandmaster",
  ];
  const rankTitle =
    RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)] || "Grandmaster";

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">
            COMMAND CENTER
          </h1>
          <p className="text-slate-400">
            Welcome back,{" "}
            <span className="text-cyan-400 font-bold">{name}</span>. Continue
            your coding quest.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">
              Level {level}
            </div>
            <div className="text-white font-black uppercase">{rankTitle}</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 flex items-center justify-center bg-gradient-to-br from-cyan-500/30 to-purple-600/30">
            <span className="text-white font-black text-lg">
              {name[0]?.toUpperCase()}
            </span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Experience"
          value={`${xp.toLocaleString()} XP`}
          icon={Zap}
          color="bg-cyan-500"
          progress={xpProgress}
        />
        <StatCard
          label="Gold Coins"
          value={coins.toLocaleString()}
          icon={Trophy}
          color="bg-amber-500"
        />
        <StatCard
          label="Daily Streak"
          value={`${streak} Days`}
          icon={Flame}
          color="bg-orange-500"
          progress={Math.min(streak * 10, 100)}
        />
        <StatCard
          label="Problems Solved"
          value={problemsSolved}
          icon={Award}
          color="bg-emerald-500"
          progress={Math.min(problemsSolved, 100)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          label="Global Rank"
          value={`#${rank}`}
          icon={TrendingUp}
          color="bg-purple-500"
        />
        <StatCard
          label="Contest Rating"
          value={contestRating}
          icon={Trophy}
          color="bg-amber-500"
        />
        <StatCard
          label="Achievements"
          value={badges}
          icon={Award}
          color="bg-cyan-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="text-cyan-400" /> QUICK ACTIONS
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                {
                  label: "Practice Problems",
                  icon: Code,
                  tab: "problems",
                  color: "from-cyan-500/20 to-cyan-600/5",
                  border: "border-cyan-500/20",
                  text: "text-cyan-400",
                },
                {
                  label: "Coding Contests",
                  icon: Trophy,
                  tab: "contests",
                  color: "from-purple-500/20 to-purple-600/5",
                  border: "border-purple-500/20",
                  text: "text-purple-400",
                },
                {
                  label: "Mock Interview",
                  icon: Zap,
                  tab: "interview",
                  color: "from-indigo-500/20 to-indigo-600/5",
                  border: "border-indigo-500/20",
                  text: "text-indigo-400",
                },
                {
                  label: "Skill Paths",
                  icon: BookOpen,
                  tab: "skillpaths",
                  color: "from-pink-500/20 to-pink-600/5",
                  border: "border-pink-500/20",
                  text: "text-pink-400",
                },
                {
                  label: "AI Mentor",
                  icon: Zap,
                  tab: "mentor",
                  color: "from-indigo-500/20 to-indigo-600/5",
                  border: "border-indigo-500/20",
                  text: "text-indigo-400",
                },
                {
                  label: "Resume Analyzer",
                  icon: BookOpen,
                  tab: "resume",
                  color: "from-emerald-500/20 to-emerald-600/5",
                  border: "border-emerald-500/20",
                  text: "text-emerald-400",
                },
                {
                  label: "Resume Comparator",
                  icon: Trophy,
                  tab: "comparator",
                  color: "from-pink-500/20 to-pink-600/5",
                  border: "border-pink-500/20",
                  text: "text-pink-400",
                },
                {
                  label: "Leaderboard",
                  icon: TrendingUp,
                  tab: "leaderboard",
                  color: "from-yellow-500/20 to-yellow-600/5",
                  border: "border-yellow-500/20",
                  text: "text-yellow-400",
                },
                {
                  label: "Community",
                  icon: BookOpen,
                  tab: "community",
                  color: "from-orange-500/20 to-orange-600/5",
                  border: "border-orange-500/20",
                  text: "text-orange-400",
                },
                {
                  label: "Profile",
                  icon: Award,
                  tab: "profile",
                  color: "from-slate-500/20 to-slate-600/5",
                  border: "border-slate-500/20",
                  text: "text-slate-300",
                },
              ].map((action) => (
                <button
                  key={action.tab}
                  onClick={() => setActiveTab?.(action.tab)}
                  className={`bg-gradient-to-br ${action.color} border ${action.border} rounded-2xl p-4 flex flex-col items-center gap-2 hover:scale-105 transition-all`}
                >
                  <action.icon size={28} className={action.text} />
                  <span
                    className={`text-xs font-bold uppercase tracking-wide ${action.text}`}
                  >
                    {action.label}
                  </span>
                </button>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-cyan-400" /> ACTIVE QUESTS
              </h2>
              <button
                onClick={() => setActiveTab?.("quests")}
                className="text-xs text-cyan-400 hover:underline font-bold"
              >
                VIEW ALL
              </button>
            </div>
            <div className="space-y-3">
              {[
                {
                  emoji: "🛡️",
                  title: "The Binary Fortress",
                  desc: "Master bitwise operations to unlock the gate.",
                  xp: 500,
                  diff: "Intermediate",
                },
                {
                  emoji: "🧪",
                  title: "Algorithm Alchemist",
                  desc: "Transform raw logic into efficient solutions.",
                  xp: 750,
                  diff: "Advanced",
                },
              ].map((quest, i) => (
                <div
                  key={i}
                  className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-900/60 transition-all cursor-pointer group"
                  onClick={() => setActiveTab?.("quests")}
                >
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {quest.emoji}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">{quest.title}</h3>
                    <p className="text-slate-400 text-sm">{quest.desc}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-bold">
                      +{quest.xp} XP
                    </div>
                    <div className="text-slate-500 text-xs uppercase">
                      {quest.diff}
                    </div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-purple-400" /> RECENT SUBMISSIONS
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-4 relative overflow-hidden">
              <div className="space-y-2">
                {recentSubmissions.length === 0 ? (
                  <div className="text-slate-500 text-sm text-center py-6">
                    No recent submissions yet.
                  </div>
                ) : (
                  recentSubmissions.slice(0, 5).map((s) => (
                    <div
                      key={`${s._id}-${s.createdAt}`}
                      className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/50"
                    >
                      <div>
                        <div className="text-white text-sm font-bold">
                          {s.problem?.title || "Problem"}
                        </div>
                        <div className="text-xs text-slate-500 uppercase">
                          {s.language} •{" "}
                          {new Date(s.createdAt).toLocaleString()}
                        </div>
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-1 rounded-full ${s.passed ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"}`}
                      >
                        {s.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={100} />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">AI MENTOR</h2>
            <div className="bg-black/20 rounded-2xl p-4 mb-4 text-sm text-slate-200 italic">
              "You're doing great! Try the 'Logic Valley' challenges next to
              boost your problem-solving skills."
            </div>
            <button
              onClick={() => setActiveTab("mentor")}
              className="w-full py-3 bg-white text-indigo-950 font-black rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-tighter"
            >
              Chat with Mentor
            </button>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">
              DAILY MISSIONS
            </h2>
            <div className="space-y-3">
              {[
                { label: "Solve 3 Problems", done: true },
                { label: "Complete a Contest", done: false },
                { label: "Analyze Your Resume", done: false },
              ].map((mission, i) => (
                <div
                  key={i}
                  className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-3"
                >
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center border ${mission.done ? "bg-emerald-500 border-emerald-500" : "border-slate-700"}`}
                  >
                    {mission.done && <Award size={12} className="text-white" />}
                  </div>
                  <span
                    className={`text-sm flex-1 ${mission.done ? "text-slate-500 line-through" : "text-slate-300"}`}
                  >
                    {mission.label}
                  </span>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900/40 border border-white/5 rounded-2xl p-4">
            <h2 className="text-sm font-bold text-white mb-3 uppercase tracking-wider">
              Level Progress
            </h2>
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Level {level}</span>
              <span>
                {xp % xpToNext} / {xpToNext} XP
              </span>
            </div>
            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
              />
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {xpToNext - (xp % xpToNext)} XP to Level {level + 1}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
