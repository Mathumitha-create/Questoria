import React from 'react';
import { motion } from 'framer-motion';
import { ShoppingBag, Star, Zap, Shield, Sparkles, Lock } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { cn } from '../lib/utils';

const ITEMS = [
  { id: 'i1', name: 'Neon Aura', price: 500, type: 'Skin', icon: Sparkles, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
  { id: 'i2', name: 'Void Blade', price: 1200, type: 'Weapon', icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
  { id: 'i3', name: 'Logic Booster', price: 200, type: 'Consumable', icon: Zap, color: 'text-pink-400', bg: 'bg-pink-400/10' },
  { id: 'i4', name: 'Stardust Wings', price: 5000, type: 'Legendary', icon: Star, color: 'text-amber-400', bg: 'bg-amber-400/10', locked: true },
];

export function Market() {
  const { profile } = useAuth();

  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2 flex items-center gap-4">
            <ShoppingBag className="text-pink-500" size={40} /> MARKETPLACE
          </h1>
          <p className="text-slate-400">Trade your hard-earned coins for legendary upgrades.</p>
        </div>
        <div className="bg-slate-900/50 border border-white/10 rounded-2xl px-6 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-yellow-500">
            <Star size={18} />
          </div>
          <span className="text-white font-black text-xl">{profile?.coins || 0}</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ITEMS.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={cn(
              "bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col hover:border-white/20 transition-all group",
              item.locked && "opacity-60"
            )}
          >
            <div className={cn("w-full aspect-square rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110", item.bg)}>
              <item.icon size={64} className={item.color} />
            </div>
            
            <div className="flex-1">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">{item.type}</div>
              <h3 className="text-xl font-black text-white mb-4">{item.name}</h3>
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-black text-white">
                <Star size={14} className="text-yellow-500" /> {item.price}
              </div>
              <button 
                disabled={item.locked || (profile?.coins || 0) < item.price}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all",
                  item.locked ? "bg-slate-800 text-slate-500" : "bg-white text-slate-950 hover:bg-cyan-400"
                )}
              >
                {item.locked ? <Lock size={14} /> : 'Purchase'}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <section className="bg-gradient-to-br from-pink-600/20 to-purple-600/20 border border-white/10 rounded-[40px] p-12 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-4xl font-black text-white mb-4">LIMITED EDITION DROP</h2>
          <p className="text-slate-300 mb-8 max-w-lg">The "Cyber-Samurai" collection is only available for the next 48 hours. Complete the weekend tournament to earn a 50% discount coupon.</p>
          <button className="px-12 py-4 bg-white text-slate-950 font-black rounded-2xl hover:bg-pink-400 transition-all shadow-xl">
            EXPLORE COLLECTION
          </button>
        </div>
        <div className="w-64 h-64 bg-slate-900/50 rounded-3xl border border-white/10 flex items-center justify-center relative">
          <div className="absolute inset-0 bg-gradient-to-t from-pink-500/20 to-transparent rounded-3xl" />
          <Shield size={120} className="text-pink-500 drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]" />
        </div>
      </section>
    </div>
  );
}
