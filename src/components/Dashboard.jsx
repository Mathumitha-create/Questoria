import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Flame, Award, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';

function StatCard({ label, value, icon: Icon, color, progress }) {
  return (
    <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-4 backdrop-blur-sm hover:border-white/20 transition-all group">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn("p-2 rounded-lg", color)}>
          <Icon size={18} className="text-white" />
        </div>
        <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-2">{value}</div>
      {progress !== undefined && (
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className={cn("h-full", color)}
          />
        </div>
      )}
    </div>
  );
}

export function Dashboard() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-1">COMMAND CENTER</h1>
          <p className="text-slate-400">Welcome back, <span className="text-cyan-400 font-bold">Player One</span>. Your next mission awaits.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-xs text-slate-500 uppercase font-bold">Level 12</div>
            <div className="text-white font-black">MASTER ARCHITECT</div>
          </div>
          <div className="w-12 h-12 rounded-full border-2 border-cyan-500 p-1">
            <img src="https://picsum.photos/seed/avatar/100" alt="Avatar" className="w-full h-full rounded-full object-cover" />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Experience" value="12,450 XP" icon={Zap} color="bg-cyan-500" progress={65} />
        <StatCard label="Skill Points" value="450 SP" icon={Target} color="bg-purple-500" />
        <StatCard label="Daily Streak" value="14 Days" icon={Flame} color="bg-orange-500" progress={80} />
        <StatCard label="Achievements" value="24 / 100" icon={Award} color="bg-emerald-500" progress={24} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Target className="text-cyan-400" /> ACTIVE QUESTS
              </h2>
              <button className="text-xs text-cyan-400 hover:underline font-bold">VIEW ALL</button>
            </div>
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center gap-4 hover:bg-slate-900/60 transition-all cursor-pointer group">
                  <div className="w-16 h-16 rounded-xl bg-slate-800 flex items-center justify-center text-2xl">
                    {i === 1 ? '🛡️' : '🧪'}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold mb-1">The Binary Fortress</h3>
                    <p className="text-slate-400 text-sm">Master the art of bitwise operations to unlock the gate.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-cyan-400 font-bold">+500 XP</div>
                    <div className="text-slate-500 text-xs uppercase">Intermediate</div>
                  </div>
                  <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                </div>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <Award className="text-purple-400" /> SKILL TREE
            </h2>
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 h-64 flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(112,0,255,0.1)_0%,transparent_70%)]" />
              <div className="flex gap-12 relative z-10">
                {[1, 2, 3].map((node) => (
                  <div key={node} className="flex flex-col items-center gap-2">
                    <div className={cn(
                      "w-16 h-16 rounded-full border-2 flex items-center justify-center transition-all duration-500 shadow-[0_0_20px_rgba(34,211,238,0.3)]",
                      node === 1 ? "border-cyan-400 bg-cyan-400/20" : "border-slate-700 bg-slate-800/50 grayscale"
                    )}>
                      <Zap size={24} className={node === 1 ? "text-cyan-400" : "text-slate-600"} />
                    </div>
                    <span className={cn("text-xs font-bold uppercase", node === 1 ? "text-cyan-400" : "text-slate-600")}>
                      {node === 1 ? 'Basics' : node === 2 ? 'Logic' : 'Advanced'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-white/10 rounded-3xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap size={120} />
            </div>
            <h2 className="text-xl font-bold text-white mb-4">AI MENTOR</h2>
            <div className="bg-black/20 rounded-2xl p-4 mb-4 text-sm text-slate-200 italic">
              "You're doing great! Try the 'Logic Valley' challenges next to boost your problem-solving skills."
            </div>
            <button className="w-full py-3 bg-white text-indigo-950 font-black rounded-xl hover:bg-cyan-400 transition-colors uppercase tracking-tighter">
              Chat with Mentor
            </button>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-4">DAILY MISSIONS</h2>
            <div className="space-y-3">
              {[
                { label: 'Solve 3 Quizzes', progress: 100, done: true },
                { label: 'Complete 1 Coding Quest', progress: 0, done: false },
                { label: 'Help a Peer', progress: 50, done: false },
              ].map((mission, i) => (
                <div key={i} className="bg-slate-900/40 border border-white/5 rounded-xl p-3 flex items-center gap-3">
                  <div className={cn(
                    "w-5 h-5 rounded flex items-center justify-center border",
                    mission.done ? "bg-emerald-500 border-emerald-500" : "border-slate-700"
                  )}>
                    {mission.done && <Award size={12} className="text-white" />}
                  </div>
                  <span className={cn("text-sm flex-1", mission.done ? "text-slate-500 line-through" : "text-slate-300")}>
                    {mission.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
