import React from 'react';
import { motion } from 'framer-motion';
import { Home, LayoutDashboard, Sword, Trophy, Code, User, Settings, ShoppingBag, LogOut } from 'lucide-react';
import { cn } from '../lib/utils';
import { logout } from '../firebase';

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 group relative",
        active ? "text-cyan-400 bg-cyan-400/10" : "text-slate-400 hover:text-white hover:bg-white/5"
      )}
    >
      <Icon size={24} className={cn("mb-1", active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]")} />
      <span className="text-[10px] font-medium uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute -left-1 w-1 h-8 bg-cyan-400 rounded-full"
        />
      )}
    </button>
  );
}

export function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'home', icon: Home, label: 'Home' },
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'quests', icon: Sword, label: 'Quests' },
    { id: 'playground', icon: Code, label: 'Code' },
    { id: 'leaderboard', icon: Trophy, label: 'Ranks' },
    { id: 'market', icon: ShoppingBag, label: 'Shop' },
    { id: 'profile', icon: User, label: 'Profile' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-8 z-50">
      <div className="mb-12">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <span className="text-2xl font-black text-white italic">S</span>
        </div>
      </div>
      
      <nav className="flex-1 flex flex-col gap-4">
        {navItems.map((item) => (
          <NavItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            active={activeTab === item.id}
            onClick={() => setActiveTab(item.id)}
          />
        ))}
      </nav>

      <div className="mt-auto flex flex-col items-center gap-2">
        <button className="p-3 text-slate-500 hover:text-white transition-colors">
          <Settings size={20} />
        </button>
        <button 
          onClick={logout}
          className="p-3 text-slate-500 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut size={20} />
        </button>
      </div>
    </aside>
  );
}
