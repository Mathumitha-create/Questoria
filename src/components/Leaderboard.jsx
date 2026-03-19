import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Trophy,
  Medal,
  Crown,
  Globe,
  Users,
  Zap,
  ChevronUp,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const tabs = [
  { id: "global", label: "Global", icon: Globe },
  { id: "college", label: "College", icon: Zap },
  { id: "friends", label: "Friends", icon: Users },
];

export function Leaderboard() {
  const [tab, setTab] = useState("global");
  const [college, setCollege] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const endpoint =
          tab === "college"
            ? `/leaderboards/college${college ? `?college=${encodeURIComponent(college)}` : ""}`
            : `/leaderboards/${tab}`;
        const { leaderboard = [] } = await api.get(endpoint);
        if (!mounted) return;
        setPlayers(leaderboard.map((p, idx) => ({ ...p, rank: idx + 1 })));
      } catch {
        if (!mounted) return;
        setPlayers([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [tab, college]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-4">
          <Trophy className="text-yellow-400" size={40} /> HALL OF FAME
        </h1>
        <p className="text-slate-400">Live rankings powered by Questoria API.</p>
      </header>

      <div className="flex flex-wrap gap-2 bg-slate-900/40 border border-white/5 rounded-2xl p-1.5 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all",
              tab === id
                ? "bg-cyan-500/20 text-cyan-400 shadow-inner"
                : "text-slate-400 hover:text-white",
            )}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "college" && (
        <div className="max-w-md">
          <input
            value={college}
            onChange={(e) => setCollege(e.target.value)}
            placeholder="Filter by college..."
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
        </div>
      )}

      <div className="space-y-4">
        <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          <span className="w-12 text-center">Rank</span>
          <span className="flex-1 ml-12">Explorer</span>
          <span className="w-24 text-center">Level</span>
          <span className="w-32 text-right">XP</span>
        </div>

        {loading ? (
          <div className="text-slate-500 text-center py-8">Loading leaderboard...</div>
        ) : players.length === 0 ? (
          <div className="text-slate-500 text-center py-8">No leaderboard data available.</div>
        ) : (
          players.map((player, i) => (
            <motion.div
              key={player._id || `${player.username}-${player.rank}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn(
                "bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center group hover:border-white/20 transition-all",
                player.rank === 1 &&
                  "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20",
              )}
            >
              <div className="w-12 flex flex-col items-center justify-center">
                {player.rank === 1 ? (
                  <Crown className="text-yellow-400 mb-1" size={20} />
                ) : player.rank === 2 ? (
                  <Medal className="text-slate-300 mb-1" size={20} />
                ) : player.rank === 3 ? (
                  <Medal className="text-amber-600 mb-1" size={20} />
                ) : (
                  <span className="text-slate-500 font-black text-xl">{player.rank}</span>
                )}
              </div>

              <div className="flex-1 flex items-center gap-4 ml-12">
                <div className="relative">
                  <img
                    src={player.profilePhoto || `https://picsum.photos/seed/${player.username}/100`}
                    alt={player.username}
                    className="w-12 h-12 rounded-xl object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  {player.rank <= 3 && (
                    <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5">
                      <ChevronUp size={10} className="text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">
                    {player.username}
                  </div>
                  <div className="text-slate-500 text-xs uppercase font-bold tracking-tighter">
                    {player.problemsSolved || 0} solved
                  </div>
                </div>
              </div>

              <div className="w-24 text-center">
                <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-black">
                  LVL {player.level || 1}
                </span>
              </div>

              <div className="w-32 text-right">
                <div className="text-white font-black">{(player.xpPoints || 0).toLocaleString()}</div>
                <div className="text-cyan-500 text-[10px] font-bold uppercase">XP Points</div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
