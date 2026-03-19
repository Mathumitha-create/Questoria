import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Clock, Users, Play, Timer } from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const TYPE_TABS = ["All", "Live", "Upcoming", "Past"];

function Countdown({ targetTime }) {
  const [remaining, setRemaining] = useState("");

  useEffect(() => {
    const update = () => {
      const diff = new Date(targetTime) - Date.now();
      if (diff <= 0) {
        setRemaining("Started");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setRemaining(`${h > 0 ? `${h}h ` : ""}${m}m ${s}s`);
    };

    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, [targetTime]);

  return (
    <div className="flex items-center gap-1.5 text-cyan-400 font-black text-sm">
      <Timer size={14} className="animate-pulse" /> {remaining}
    </div>
  );
}

export function Contests({ onSelectProblem }) {
  const [activeType, setActiveType] = useState("All");
  const [selectedContest, setSelectedContest] = useState(null);
  const [contests, setContests] = useState({
    live: [],
    upcoming: [],
    past: [],
  });
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(false);

  const loadContests = async () => {
    setLoading(true);
    try {
      const data = await api.get("/contests");
      setContests(data);
    } catch {
      setContests({ live: [], upcoming: [], past: [] });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadContests();
  }, []);

  const allContests = useMemo(
    () => [
      ...(contests.live || []).map((c) => ({ ...c, type: "live" })),
      ...(contests.upcoming || []).map((c) => ({ ...c, type: "upcoming" })),
      ...(contests.past || []).map((c) => ({ ...c, type: "past" })),
    ],
    [contests],
  );

  const filtered =
    activeType === "All"
      ? allContests
      : allContests.filter((c) => c.type === activeType.toLowerCase());

  const typeColor = (t) =>
    ({
      live: "text-emerald-400 bg-emerald-400/10 border-emerald-400/20",
      upcoming: "text-cyan-400 bg-cyan-400/10 border-cyan-400/20",
      past: "text-slate-400 bg-slate-400/10 border-slate-400/20",
    })[t] || "text-slate-400 bg-slate-400/10 border-slate-400/20";

  const registerForContest = async () => {
    if (!selectedContest?._id || selectedContest?.isRegistered || registering) {
      return;
    }

    setRegistering(true);
    try {
      await api.post(`/contests/${selectedContest._id}/register`);
      await loadContests();
      setSelectedContest((prev) =>
        prev
          ? {
              ...prev,
              isRegistered: true,
              participantsCount: (prev.participantsCount || 0) + 1,
            }
          : prev,
      );
    } finally {
      setRegistering(false);
    }
  };

  if (selectedContest) {
    return (
      <div className="space-y-8">
        <button
          onClick={() => setSelectedContest(null)}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm"
        >
          ← Back to Contests
        </button>

        <div className="bg-gradient-to-br from-cyan-900/20 to-purple-900/20 border border-white/10 rounded-3xl p-8">
          <h1 className="text-3xl font-black text-white mb-2">
            {selectedContest.title}
          </h1>
          <p className="text-slate-400 mb-6">
            {selectedContest.description || "Contest details"}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase mb-2">
                Start
              </div>
              <div className="text-white font-black text-sm">
                {new Date(selectedContest.startsAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase mb-2">
                End
              </div>
              <div className="text-white font-black text-sm">
                {new Date(selectedContest.endsAt).toLocaleString()}
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase mb-2">
                Problems
              </div>
              <div className="text-white font-black text-sm">
                {(selectedContest.problems || []).length}
              </div>
            </div>
            <div className="bg-slate-900/60 rounded-2xl p-4 border border-white/5">
              <div className="text-slate-500 text-xs font-black uppercase mb-2">
                Participants
              </div>
              <div className="text-white font-black text-sm">
                {selectedContest.participantsCount || 0}
              </div>
            </div>
          </div>

          {selectedContest.type !== "past" && (
            <div className="mt-6 flex items-center gap-4">
              <Countdown targetTime={selectedContest.startsAt} />
              <button
                onClick={registerForContest}
                disabled={selectedContest.isRegistered || registering}
                className="flex items-center gap-2 px-8 py-3 bg-cyan-500 text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-60"
              >
                <Play size={16} fill="currentColor" />
                {selectedContest.isRegistered
                  ? "Registered"
                  : registering
                    ? "Registering..."
                    : "Attend Contest"}
              </button>
            </div>
          )}

          {!!selectedContest.problems?.length && (
            <div className="mt-8 space-y-3">
              <h3 className="text-white font-black uppercase tracking-widest text-xs">
                Contest Problems
              </h3>
              {selectedContest.problems.map((p) => (
                <div
                  key={p._id}
                  className="bg-slate-900/60 rounded-xl p-4 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="text-white font-bold">{p.title}</div>
                    <div className="text-slate-500 text-xs uppercase mt-1">
                      {p.difficulty}
                    </div>
                  </div>
                  <button
                    onClick={() =>
                      onSelectProblem?.({
                        ...p,
                        contestId: selectedContest._id,
                      })
                    }
                    className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 font-black text-xs hover:bg-cyan-400 transition-colors"
                  >
                    Solve
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
            <Trophy className="text-yellow-400" size={36} /> CONTESTS
          </h1>
          <p className="text-slate-400">Live and upcoming coding contests.</p>
        </div>
        <div className="flex items-center gap-3">
          {TYPE_TABS.map((t) => (
            <button
              key={t}
              onClick={() => setActiveType(t)}
              className={cn(
                "px-5 py-2 rounded-xl text-sm font-black transition-all",
                activeType === t
                  ? "bg-cyan-500 text-slate-950"
                  : "bg-slate-900/50 text-slate-400 hover:text-white border border-white/5",
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </header>

      {loading ? (
        <div className="text-center py-16 text-slate-600">
          Loading contests...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((contest, i) => (
            <motion.div
              key={contest._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 hover:border-white/20 hover:bg-slate-900/60 transition-all cursor-pointer"
              onClick={() => setSelectedContest(contest)}
            >
              <div className="flex items-start justify-between mb-4">
                <span
                  className={cn(
                    "text-xs font-black px-3 py-1 rounded-full border uppercase tracking-widest",
                    typeColor(contest.type),
                  )}
                >
                  {contest.type}
                </span>
                <div className="text-slate-400 text-xs flex items-center gap-1">
                  <Users size={12} /> {contest.participantsCount || 0} joined
                </div>
              </div>
              <h3 className="text-xl font-black text-white mb-2">
                {contest.title}
              </h3>
              <p className="text-slate-500 text-sm mb-5 line-clamp-2">
                {contest.description || "Contest"}
              </p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                  <Clock size={12} />{" "}
                  {new Date(contest.startsAt).toLocaleString()}
                </div>
                {contest.type !== "past" && (
                  <Countdown targetTime={contest.startsAt} />
                )}
              </div>
            </motion.div>
          ))}
          {!filtered.length && (
            <div className="text-slate-600 py-8">No contests found.</div>
          )}
        </div>
      )}
    </div>
  );
}
