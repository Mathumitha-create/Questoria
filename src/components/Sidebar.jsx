import React from "react";
import { motion } from "framer-motion";
import {
  Home,
  LayoutDashboard,
  Sword,
  Trophy,
  Code,
  User,
  Settings,
  ShoppingBag,
  LogOut,
  FileText,
  GitCompare,
  MessageCircle,
  Map,
  Shield,
  BookOpen,
  BrainCircuit,
} from "lucide-react";
import { cn } from "../lib/utils";
import { useAuth } from "../AuthContext";

function NavItem({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={cn(
        "flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 group relative",
        active
          ? "text-cyan-400 bg-cyan-400/10"
          : "text-slate-400 hover:text-white hover:bg-white/5",
      )}
    >
      <Icon
        size={22}
        className={cn(
          "mb-1",
          active && "drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]",
        )}
      />
      <span className="text-[9px] font-medium uppercase tracking-wider leading-tight">
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute -left-1 w-1 h-8 bg-cyan-400 rounded-full"
        />
      )}
    </button>
  );
}

export function Sidebar({ activeTab, setActiveTab, isAdmin = false }) {
  const { logout } = useAuth();
  const navItems = [
    { id: "home", icon: Home, label: "Home" },
    { id: "dashboard", icon: LayoutDashboard, label: "Dash" },
    { id: "quests", icon: Sword, label: "Quests" },
    { id: "problems", icon: Code, label: "Code" },
    { id: "contests", icon: Trophy, label: "Contest" },
    { id: "interview", icon: BrainCircuit, label: "Mock" },
    { id: "skillpaths", icon: Map, label: "Paths" },
    { id: "community", icon: MessageCircle, label: "Forum" },
    { id: "resume", icon: FileText, label: "Resume" },
    { id: "comparator", icon: GitCompare, label: "Compare" },
    { id: "leaderboard", icon: BookOpen, label: "Ranks" },
    { id: "market", icon: ShoppingBag, label: "Shop" },
    { id: "profile", icon: User, label: "Profile" },
    ...(isAdmin ? [{ id: "admin", icon: Shield, label: "Admin" }] : []),
  ];

  return (
    <aside className="fixed left-0 top-0 h-full w-20 bg-slate-950/80 backdrop-blur-xl border-r border-white/10 flex flex-col items-center py-6 z-50 overflow-y-auto scrollbar-hide">
      <div className="mb-8 shrink-0">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <span className="text-xl font-black text-white italic">Q</span>
        </div>
      </div>

      <nav className="flex-1 flex flex-col gap-2">
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

      <div className="mt-4 flex flex-col items-center gap-2 shrink-0">
        <button
          className="p-2.5 text-slate-500 hover:text-white transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <button
          onClick={logout}
          className="p-2.5 text-slate-500 hover:text-red-400 transition-colors"
          title="Sign Out"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}
