import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, ChevronUp, ChevronDown, Sword } from 'lucide-react';
import { cn } from '../lib/utils';

const TOP_PLAYERS = [
  { rank: 1, name: 'CyberKnight', xp: '45,200', level: 42, avatar: 'https://picsum.photos/seed/p1/100', trend: 'up' },
  { rank: 2, name: 'NeonGhost', xp: '42,150', level: 38, avatar: 'https://picsum.photos/seed/p2/100', trend: 'down' },
  { rank: 3, name: 'BitMaster', xp: '39,800', level: 35, avatar: 'https://picsum.photos/seed/p3/100', trend: 'up' },
  { rank: 4, name: 'LogicQueen', xp: '35,400', level: 32, avatar: 'https://picsum.photos/seed/p4/100', trend: 'up' },
  { rank: 5, name: 'CodeNinja', xp: '32,100', level: 30, avatar: 'https://picsum.photos/seed/p5/100', trend: 'none' },
];

export function Leaderboard() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-4">
          <Trophy className="text-yellow-400" size={40} /> HALL OF FAME
        </h1>
        <p className="text-slate-400">The most legendary explorers of Questoria.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900/40 border border-white/5 rounded-2xl p-4 flex items-center text-xs font-bold text-slate-500 uppercase tracking-widest">
            <span className="w-12 text-center">Rank</span>
            <span className="flex-1 ml-12">Explorer</span>
            <span className="w-24 text-center">Level</span>
            <span className="w-32 text-right">Experience</span>
          </div>

          <div className="space-y-3">
            {TOP_PLAYERS.map((player, i) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={cn(
                  "bg-slate-900/60 border border-white/5 rounded-2xl p-4 flex items-center group hover:border-white/20 transition-all",
                  player.rank === 1 && "bg-gradient-to-r from-yellow-500/10 to-transparent border-yellow-500/20"
                )}
              >
                <div className="w-12 flex flex-col items-center justify-center">
                  {player.rank === 1 ? <Crown className="text-yellow-400 mb-1" size={20} /> : 
                   player.rank === 2 ? <Medal className="text-slate-300 mb-1" size={20} /> :
                   player.rank === 3 ? <Medal className="text-amber-600 mb-1" size={20} /> :
                   <span className="text-slate-500 font-black text-xl">{player.rank}</span>}
                </div>

                <div className="flex-1 flex items-center gap-4 ml-12">
                  <div className="relative">
                    <img src={player.avatar} alt={player.name} className="w-12 h-12 rounded-xl object-cover border border-white/10" />
                    {player.trend === 'up' && <div className="absolute -top-1 -right-1 bg-emerald-500 rounded-full p-0.5"><ChevronUp size={10} className="text-white" /></div>}
                    {player.trend === 'down' && <div className="absolute -bottom-1 -right-1 bg-red-500 rounded-full p-0.5"><ChevronDown size={10} className="text-white" /></div>}
                  </div>
                  <div>
                    <div className="text-white font-bold group-hover:text-cyan-400 transition-colors">{player.name}</div>
                    <div className="text-slate-500 text-xs uppercase font-bold tracking-tighter">Elite Explorer</div>
                  </div>
                </div>

                <div className="w-24 text-center">
                  <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded-full text-xs font-black">LVL {player.level}</span>
                </div>

                <div className="w-32 text-right">
                  <div className="text-white font-black">{player.xp}</div>
                  <div className="text-cyan-500 text-[10px] font-bold uppercase">XP Points</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <section className="bg-slate-900/40 border border-white/5 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-white mb-6">YOUR RANKING</h2>
            <div className="flex flex-col items-center text-center">
              <div className="w-24 h-24 rounded-3xl bg-slate-800 border-2 border-cyan-500 p-2 mb-4 relative">
                <img src="https://picsum.photos/seed/avatar/200" alt="Me" className="w-full h-full rounded-2xl object-cover" />
                <div className="absolute -bottom-3 -right-3 bg-cyan-500 text-slate-950 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg shadow-lg">
                  12
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-1">PLAYER ONE</h3>
              <p className="text-slate-500 text-sm uppercase font-bold tracking-widest mb-6">Global Rank: #1,245</p>
              
              <div className="w-full grid grid-cols-2 gap-4">
                <div className="bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Top %</div>
                  <div className="text-white font-black text-xl">15%</div>
                </div>
                <div className="bg-slate-800/50 rounded-2xl p-4">
                  <div className="text-slate-500 text-[10px] uppercase font-bold mb-1">Points</div>
                  <div className="text-white font-black text-xl">12.4k</div>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/20 rounded-3xl p-6">
            <h2 className="text-xl font-bold text-yellow-500 mb-4 flex items-center gap-2">
              <Trophy size={20} /> SEASON REWARDS
            </h2>
            <p className="text-yellow-100/60 text-sm mb-6 italic">
              "Finish in the top 100 to unlock the exclusive 'Stardust' avatar skin."
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Medal size={20} />
                </div>
                <div className="text-sm font-bold text-white">Legendary Badge</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                  <Sword size={20} />
                </div>
                <div className="text-sm font-bold text-white">Golden Blade Skin</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
