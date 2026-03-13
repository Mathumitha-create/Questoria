import React from 'react';
import { motion } from 'framer-motion';
import { Sword, Shield, Zap, Brain, Lock, Star, Clock } from 'lucide-react';
import { cn } from '../lib/utils';

const QUESTS = [
  { id: 'q1', title: 'The Binary Fortress', zone: 'Coding Kingdom', difficulty: 'Intermediate', reward: '500 XP', icon: Shield, color: 'text-cyan-400', bg: 'bg-cyan-400/10', locked: false },
  { id: 'q2', title: 'Neural Nexus', zone: 'AI Lab', difficulty: 'Advanced', reward: '1200 XP', icon: Brain, color: 'text-purple-400', bg: 'bg-purple-400/10', locked: false },
  { id: 'q3', title: 'Logic Labyrinth', zone: 'Logic Valley', difficulty: 'Beginner', reward: '200 XP', icon: Zap, color: 'text-pink-400', bg: 'bg-pink-400/10', locked: false },
  { id: 'q4', title: 'Quantum Leap', zone: 'Innovation Hub', difficulty: 'Boss', reward: '5000 XP', icon: Sword, color: 'text-amber-400', bg: 'bg-amber-400/10', locked: true },
];

export function Quests() {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">ACTIVE MISSIONS</h1>
          <p className="text-slate-400">Choose your path and conquer the learning kingdoms.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-2 flex items-center gap-3">
            <Star size={20} className="text-yellow-400" />
            <span className="text-white font-black">2,450</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {QUESTS.map((quest, i) => (
          <motion.div
            key={quest.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "relative group cursor-pointer",
              quest.locked ? "opacity-60 grayscale pointer-events-none" : ""
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-3xl -z-10" />
            <div className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 h-full flex flex-col hover:border-white/20 hover:bg-slate-900/60 transition-all duration-500">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6", quest.bg)}>
                <quest.icon size={32} className={quest.color} />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className={cn("text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded", quest.bg, quest.color)}>
                    {quest.zone}
                  </span>
                  {quest.locked && <Lock size={12} className="text-slate-500" />}
                </div>
                <h3 className="text-xl font-black text-white mb-2 leading-tight">{quest.title}</h3>
                <div className="flex items-center gap-4 text-slate-500 text-xs font-bold uppercase mb-6">
                  <span className="flex items-center gap-1"><Clock size={12} /> 45m</span>
                  <span className="flex items-center gap-1"><Star size={12} /> {quest.difficulty}</span>
                </div>
              </div>

              <div className="mt-auto pt-6 border-t border-white/5 flex items-center justify-between">
                <div className="text-cyan-400 font-black">{quest.reward}</div>
                <button className="px-4 py-2 bg-white/5 rounded-xl text-white text-xs font-black uppercase hover:bg-white/10 transition-colors">
                  {quest.locked ? 'Locked' : 'Accept'}
                </button>
              </div>
            </div>
            
            {quest.locked && (
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="bg-slate-950/80 border border-white/10 p-4 rounded-2xl text-center backdrop-blur-sm">
                  <Lock size={24} className="text-slate-500 mx-auto mb-2" />
                  <div className="text-xs font-black text-slate-400 uppercase">Unlock at Level 15</div>
                </div>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-5">
          <Sword size={200} />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-3xl font-black text-white mb-4">WEEKLY TOURNAMENT</h2>
          <p className="text-slate-400 mb-8">Join forces with your team and compete in the ultimate coding challenge. Top teams win exclusive legendary gear.</p>
          <div className="flex gap-4">
            <button className="px-8 py-3 bg-indigo-600 text-white font-black rounded-xl hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.4)]">
              JOIN TOURNAMENT
            </button>
            <button className="px-8 py-3 bg-white/5 text-white font-black rounded-xl hover:bg-white/10 transition-all">
              VIEW RULES
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
