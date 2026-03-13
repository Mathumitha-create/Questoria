import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "./components/Sidebar";
import { Home } from "./components/Home";
import { Dashboard } from "./components/Dashboard";
import { Quests } from "./components/Quests";
import { Playground } from "./components/Playground";
import { Leaderboard } from "./components/Leaderboard";
import { AIMentor } from "./components/AIMentor";
import { Landing } from "./components/Landing";
import { Profile } from "./components/Profile";
import { Market } from "./components/Market";
import { Login } from "./components/Login";
import { useAuth } from "./AuthContext";
import { Bot, X, Loader2 } from "lucide-react";

export default function App() {
  const { user, profile, loading } = useAuth();
  const [activeTab, setActiveTab] = useState("home");
  const [showMentor, setShowMentor] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="text-cyan-500 animate-spin" size={48} />
      </div>
    );
  }

  if (!user) {
    if (showLogin) return <Login onBack={() => setShowLogin(false)} />;
    return <Landing onEnterApp={() => setShowLogin(true)} />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard />;
      case "quests":
        return <Quests />;
      case "playground":
        return <Playground />;
      case "leaderboard":
        return <Leaderboard />;
      case "profile":
        return <Profile />;
      case "market":
        return <Market />;
      default:
        return <Dashboard />;
    }
  };

  if (activeTab === "home") {
    return <Home onStart={() => setActiveTab("dashboard")} />;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="pl-20 min-h-screen">
        <div className="max-w-7xl mx-auto px-8 py-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="min-h-[calc(100vh-6rem)]"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Floating AI Mentor Trigger */}
      <div className="fixed bottom-8 right-8 z-50">
        <AnimatePresence>
          {showMentor && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="absolute bottom-20 right-0 w-96 h-[600px] shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            >
              <AIMentor />
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={() => setShowMentor(!showMentor)}
          className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-purple-600 flex items-center justify-center text-white shadow-[0_0_30px_rgba(34,211,238,0.5)] hover:scale-110 transition-transform group"
        >
          {showMentor ? (
            <X size={32} />
          ) : (
            <Bot size={32} className="group-hover:animate-bounce" />
          )}
        </button>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/10 blur-[120px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay" />
      </div>
    </div>
  );
}
