import React, { useEffect, useState } from "react";
import {
  Shield,
  Users,
  Code2,
  Trophy,
  Flag,
  Plus,
  Search,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../lib/utils";
import { api } from "../lib/api";

const ADMIN_TABS = ["Overview", "Problems", "Contests", "Users", "Reports"];

function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div className="bg-slate-900/50 border border-white/10 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-xl", color + "/20")}>
          <Icon size={18} className={color.replace("bg-", "text-")} />
        </div>
        <span className="text-slate-400 text-xs font-black uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="text-3xl font-black text-white">{value}</div>
    </div>
  );
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [overview, setOverview] = useState({
    users: 0,
    problems: 0,
    contests: 0,
    reports: 0,
  });
  const [problems, setProblems] = useState([]);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [contests, setContests] = useState([]);
  const [userSearch, setUserSearch] = useState("");

  const [problemForm, setProblemForm] = useState({
    title: "",
    description: "",
    difficulty: "Easy",
    tags: "",
    constraints: "",
  });

  const [contestForm, setContestForm] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
  });

  const loadAll = async () => {
    const [ov, probs, us, reps, cons] = await Promise.all([
      api.get("/admin/overview"),
      api.get("/problems"),
      api.get("/admin/users"),
      api.get("/admin/reports"),
      api.get("/contests"),
    ]);

    setOverview(ov);
    setProblems(probs.problems || []);
    setUsers(us.users || []);
    setReports(reps.reports || []);
    setContests([
      ...(cons.live || []),
      ...(cons.upcoming || []),
      ...(cons.past || []),
    ]);
  };

  useEffect(() => {
    loadAll().catch(() => {});
  }, []);

  const addProblem = async () => {
    if (!problemForm.title || !problemForm.description) return;
    await api.post("/problems", {
      title: problemForm.title,
      description: problemForm.description,
      difficulty: problemForm.difficulty,
      tags: problemForm.tags
        .split(",")
        .map((x) => x.trim())
        .filter(Boolean),
      constraints: problemForm.constraints
        .split("\n")
        .map((x) => x.trim())
        .filter(Boolean),
      examples: [],
      testCases: [],
      starterCode: {
        javascript: "",
        python: "",
        cpp: "",
        java: "",
      },
    });
    setProblemForm({
      title: "",
      description: "",
      difficulty: "Easy",
      tags: "",
      constraints: "",
    });
    await loadAll();
  };

  const removeProblem = async (id) => {
    await api.delete(`/problems/${id}`);
    await loadAll();
  };

  const toggleBan = async (user) => {
    await api.patch(`/admin/users/${user._id}/ban`, { banned: !user.isBanned });
    await loadAll();
  };

  const resolveReport = async (reportId) => {
    await api.patch(`/admin/reports/${reportId}/resolve`, {});
    await loadAll();
  };

  const createContest = async () => {
    if (!contestForm.title || !contestForm.startsAt || !contestForm.endsAt)
      return;
    await api.post("/contests", {
      title: contestForm.title,
      description: contestForm.description,
      startsAt: new Date(contestForm.startsAt).toISOString(),
      endsAt: new Date(contestForm.endsAt).toISOString(),
      problems: [],
      isPublished: true,
    });
    setContestForm({ title: "", description: "", startsAt: "", endsAt: "" });
    await loadAll();
  };

  const filteredUsers = users.filter(
    (u) =>
      u.username?.toLowerCase().includes(userSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(userSearch.toLowerCase()),
  );

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1 flex items-center gap-3">
            <Shield className="text-amber-400" size={36} /> ADMIN PANEL
          </h1>
          <p className="text-slate-400">
            Production admin controls for Questoria.
          </p>
        </div>
      </header>

      <div className="flex gap-1 bg-slate-900/50 p-1.5 rounded-2xl border border-white/5 w-fit">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-5 py-2 rounded-xl text-sm font-black transition-all",
              activeTab === tab
                ? "bg-slate-800 text-white"
                : "text-slate-500 hover:text-white",
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "Overview" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Total Users"
            value={overview.users}
            icon={Users}
            color="bg-cyan-500"
          />
          <StatCard
            label="Problems"
            value={overview.problems}
            icon={Code2}
            color="bg-emerald-500"
          />
          <StatCard
            label="Contests"
            value={overview.contests}
            icon={Trophy}
            color="bg-purple-500"
          />
          <StatCard
            label="Reports"
            value={overview.reports}
            icon={Flag}
            color="bg-red-500"
          />
        </div>
      )}

      {activeTab === "Problems" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={problemForm.title}
              onChange={(e) =>
                setProblemForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Problem title"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <select
              value={problemForm.difficulty}
              onChange={(e) =>
                setProblemForm((f) => ({ ...f, difficulty: e.target.value }))
              }
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
            <input
              value={problemForm.tags}
              onChange={(e) =>
                setProblemForm((f) => ({ ...f, tags: e.target.value }))
              }
              placeholder="tags: arrays, dp"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <textarea
              value={problemForm.constraints}
              onChange={(e) =>
                setProblemForm((f) => ({ ...f, constraints: e.target.value }))
              }
              placeholder="one constraint per line"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <textarea
            value={problemForm.description}
            onChange={(e) =>
              setProblemForm((f) => ({ ...f, description: e.target.value }))
            }
            placeholder="Problem description"
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
          />
          <button
            onClick={addProblem}
            className="px-5 py-2.5 bg-cyan-500 text-slate-950 rounded-xl font-black text-sm"
          >
            <Plus size={14} className="inline mr-1" /> Add Problem
          </button>

          <div className="space-y-2">
            {problems.map((p) => (
              <div
                key={p._id}
                className="flex items-center gap-4 px-5 py-4 bg-slate-900/50 border border-white/5 rounded-2xl"
              >
                <div className="flex-1 text-white font-bold">{p.title}</div>
                <span className="text-xs text-slate-400">{p.difficulty}</span>
                <button
                  onClick={() => removeProblem(p._id)}
                  className="text-red-400 text-xs font-black"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Contests" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <input
              value={contestForm.title}
              onChange={(e) =>
                setContestForm((f) => ({ ...f, title: e.target.value }))
              }
              placeholder="Contest title"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              value={contestForm.description}
              onChange={(e) =>
                setContestForm((f) => ({ ...f, description: e.target.value }))
              }
              placeholder="Contest description"
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              type="datetime-local"
              value={contestForm.startsAt}
              onChange={(e) =>
                setContestForm((f) => ({ ...f, startsAt: e.target.value }))
              }
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
            <input
              type="datetime-local"
              value={contestForm.endsAt}
              onChange={(e) =>
                setContestForm((f) => ({ ...f, endsAt: e.target.value }))
              }
              className="bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white"
            />
          </div>
          <button
            onClick={createContest}
            className="px-5 py-2.5 bg-yellow-500 text-slate-950 rounded-xl font-black text-sm"
          >
            <Plus size={14} className="inline mr-1" /> Create Contest
          </button>

          <div className="space-y-2">
            {contests.map((c) => (
              <div
                key={c._id}
                className="px-5 py-4 bg-slate-900/50 border border-white/5 rounded-2xl"
              >
                <div className="text-white font-bold">{c.title}</div>
                <div className="text-xs text-slate-500">
                  {new Date(c.startsAt).toLocaleString()} -{" "}
                  {new Date(c.endsAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "Users" && (
        <div className="space-y-4">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              placeholder="Search users..."
              className="w-full bg-slate-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white"
            />
          </div>

          {filteredUsers.map((u) => (
            <div
              key={u._id}
              className="flex items-center gap-5 px-5 py-4 bg-slate-900/50 border border-white/5 rounded-2xl"
            >
              <div className="flex-1">
                <div className="text-white font-bold text-sm">{u.username}</div>
                <div className="text-slate-500 text-xs">{u.email}</div>
              </div>
              <span
                className={cn(
                  "text-xs font-black uppercase px-2.5 py-1 rounded-full",
                  u.isBanned
                    ? "text-red-400 bg-red-400/10"
                    : "text-emerald-400 bg-emerald-400/10",
                )}
              >
                {u.isBanned ? "banned" : "active"}
              </span>
              <button
                onClick={() => toggleBan(u)}
                className="text-xs font-black text-cyan-400"
              >
                {u.isBanned ? "Unban" : "Ban"}
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === "Reports" && (
        <div className="space-y-4">
          {reports.map((r) => (
            <div
              key={r._id}
              className="flex items-start gap-4 p-5 rounded-2xl border bg-red-500/5 border-red-500/20"
            >
              <Flag size={18} className="text-red-400" />
              <div className="flex-1">
                <div className="text-sm font-black text-red-400">
                  Reported Post
                </div>
                <p className="text-slate-300 text-sm mt-1">{r.title}</p>
              </div>
              <button
                onClick={() => resolveReport(r._id)}
                className="px-3 py-2 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-black"
              >
                <CheckCircle2 size={12} className="inline mr-1" /> Resolve
              </button>
            </div>
          ))}
          {!reports.length && (
            <div className="text-slate-600">No reports pending.</div>
          )}
        </div>
      )}
    </div>
  );
}
