import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sword,
  Zap,
  Brain,
  Trophy,
  Users,
  Star,
  ChevronRight,
  Play,
  Shield,
  Sparkles,
  Code2,
  Bot,
  Map,
  ChevronLeft,
} from "lucide-react";
import { signInWithGoogle } from "../firebase";
import { cn } from "../lib/utils";

const SLIDES = [
  {
    id: 1,
    label: "Epic Quests Await",
    sublabel: "Embark on story-driven coding missions across 50+ realms",
    from: "from-cyan-900",
    via: "via-slate-900",
    to: "to-slate-950",
    accent: "text-cyan-400",
    glow: "rgba(34,211,238,0.25)",
    Icon: Map,
    iconBg: "bg-cyan-500/20",
    iconColor: "text-cyan-400",
    stats: [
      { label: "Active Quests", value: "500+" },
      { label: "Realms", value: "52" },
      { label: "XP Rewards", value: "10K" },
    ],
    badge: "QUEST SYSTEM",
  },
  {
    id: 2,
    label: "AI Mentor By Your Side",
    sublabel: "Real-time AI coaching adapts to your unique learning pace",
    from: "from-purple-900",
    via: "via-slate-900",
    to: "to-slate-950",
    accent: "text-purple-400",
    glow: "rgba(168,85,247,0.25)",
    Icon: Bot,
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-400",
    stats: [
      { label: "Hints/Day", value: "Unlimited" },
      { label: "Accuracy", value: "98%" },
      { label: "Languages", value: "12+" },
    ],
    badge: "AI MENTOR",
  },
  {
    id: 3,
    label: "Live Code Playground",
    sublabel: "Write, run, and debug code instantly in your browser",
    from: "from-pink-900",
    via: "via-slate-900",
    to: "to-slate-950",
    accent: "text-pink-400",
    glow: "rgba(236,72,153,0.25)",
    Icon: Code2,
    iconBg: "bg-pink-500/20",
    iconColor: "text-pink-400",
    stats: [
      { label: "Languages", value: "20+" },
      { label: "Run Time", value: "<0.5s" },
      { label: "Saved Projects", value: "∞" },
    ],
    badge: "PLAYGROUND",
  },
  {
    id: 4,
    label: "Climb the Leaderboard",
    sublabel: "Compete globally, earn trophies, and claim legendary rank",
    from: "from-yellow-900",
    via: "via-slate-900",
    to: "to-slate-950",
    accent: "text-yellow-400",
    glow: "rgba(234,179,8,0.25)",
    Icon: Trophy,
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-400",
    stats: [
      { label: "Global Players", value: "50K+" },
      { label: "Tournaments/Week", value: "12" },
      { label: "Countries", value: "120+" },
    ],
    badge: "LEADERBOARD",
  },
];

const HeroSlider = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div
      className="relative rounded-[40px] overflow-hidden border border-white/10 shadow-2xl"
      style={{ minHeight: 380 }}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={slide.id}
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.55, ease: "easeInOut" }}
          className={`bg-gradient-to-br ${slide.from} ${slide.via} ${slide.to} p-10 md:p-14 flex flex-col md:flex-row items-center gap-10`}
          style={{ minHeight: 380 }}
        >
          {/* Left content */}
          <div className="flex-1 text-left">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-black tracking-widest border border-white/10 bg-white/5 ${slide.accent} mb-6`}
            >
              {slide.badge}
            </span>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter leading-tight mb-4">
              {slide.label}
            </h3>
            <p className="text-slate-400 text-lg mb-8 max-w-md">
              {slide.sublabel}
            </p>
            <div className="flex gap-8">
              {slide.stats.map((s, i) => (
                <div key={i}>
                  <div className={`text-2xl font-black ${slide.accent}`}>
                    {s.value}
                  </div>
                  <div className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Right icon panel */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className="relative">
              <div
                className="absolute inset-0 blur-[60px] rounded-full"
                style={{ background: slide.glow }}
              />
              <div
                className={`relative w-40 h-40 rounded-[40px] ${slide.iconBg} border border-white/10 flex items-center justify-center shadow-2xl`}
              >
                <slide.Icon
                  size={72}
                  className={slide.iconColor}
                  strokeWidth={1.2}
                />
              </div>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={() =>
          setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)
        }
        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
      >
        <ChevronLeft size={18} className="text-white" />
      </button>
      <button
        onClick={() => setCurrent((prev) => (prev + 1) % SLIDES.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 flex items-center justify-center transition-all"
      >
        <ChevronRight size={18} className="text-white" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2">
        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-2 rounded-full transition-all duration-300 ${i === current ? "w-8 bg-white" : "w-2 bg-white/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

const FeatureCard = ({ icon: Icon, title, description, color }) => (
  <motion.div
    whileHover={{ y: -10 }}
    className="bg-slate-900/40 border border-white/5 p-8 rounded-[32px] backdrop-blur-sm hover:border-white/20 transition-all"
  >
    <div
      className={cn(
        "w-14 h-14 rounded-2xl flex items-center justify-center mb-6",
        color,
      )}
    >
      <Icon size={28} className="text-white" />
    </div>
    <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
      {title}
    </h3>
    <p className="text-slate-400 leading-relaxed">{description}</p>
  </motion.div>
);

export function Landing({ onEnterApp }) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 selection:bg-cyan-500/30 overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-8 py-6 flex items-center justify-between backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.3)]">
            <Sparkles size={24} className="text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-white">
            QUESTORIA
          </span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">
            Features
          </a>
          <a href="#stats" className="hover:text-cyan-400 transition-colors">
            Universe
          </a>
          <a
            href="#community"
            className="hover:text-cyan-400 transition-colors"
          >
            Community
          </a>
        </div>
        <button
          onClick={onEnterApp}
          className="px-8 py-3 bg-white text-slate-950 font-black rounded-xl hover:bg-cyan-400 transition-all shadow-xl"
        >
          ENTER APP
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-8 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-cyan-500/20 blur-[120px] rounded-full animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-500/20 blur-[120px] rounded-full animate-pulse [animation-delay:2s]" />
        </div>

        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-cyan-400 text-xs font-black uppercase tracking-[0.2em] mb-8">
              <Zap size={14} /> The Future of Learning is Here
            </div>
            <h1 className="text-7xl md:text-9xl font-black text-white tracking-tighter leading-[0.85] mb-8">
              LEARN LIKE A <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500">
                LEGEND.
              </span>
            </h1>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-12 leading-relaxed">
              Questoria is the world's first gamified learning universe designed
              for the next generation of tech leaders. Master coding, AI, and
              logic through epic quests.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <button
                onClick={onEnterApp}
                className="group relative px-10 py-5 bg-cyan-500 text-slate-950 font-black rounded-2xl overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)]"
              >
                <span className="relative flex items-center gap-2 text-lg">
                  <Sword size={24} /> START YOUR QUEST
                </span>
              </button>
              <button className="px-10 py-5 bg-white/5 backdrop-blur-md border border-white/10 text-white font-black rounded-2xl hover:bg-white/10 transition-all flex items-center gap-2 text-lg">
                <Play size={24} /> WATCH TRAILER
              </button>
            </div>
          </motion.div>
        </div>

        {/* Hero Slider */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="max-w-5xl mx-auto mt-24 relative"
        >
          <div className="absolute inset-0 bg-cyan-500/10 blur-[100px] -z-10" />
          <HeroSlider />
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-8 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-white mb-6">
              UNLEASH YOUR POTENTIAL
            </h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Every lesson is a mission. Every skill is a superpower. Every
              student is a hero.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Brain}
              title="AI-Powered Mentorship"
              description="Our advanced AI Mentor guides you through complex concepts with personalized feedback and game-like encouragement."
              color="bg-purple-600"
            />
            <FeatureCard
              icon={Trophy}
              title="Competitive Arena"
              description="Climb the global leaderboards, join weekly tournaments, and earn legendary status in the Hall of Fame."
              color="bg-cyan-600"
            />
            <FeatureCard
              icon={Zap}
              title="Real-Time Playground"
              description="Write code, run simulations, and see instant results in our high-performance integrated development environment."
              color="bg-pink-600"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section
        id="stats"
        className="py-32 px-8 bg-white/5 border-y border-white/5"
      >
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: "Explorers", value: "50K+" },
            { label: "Quests Completed", value: "1.2M" },
            { label: "Skills Mastered", value: "240K" },
            { label: "Countries", value: "120+" },
          ].map((stat, i) => (
            <div key={i}>
              <div className="text-5xl font-black text-white mb-2">
                {stat.value}
              </div>
              <div className="text-sm font-bold text-cyan-400 uppercase tracking-widest">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-40 px-8 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-500/5 to-purple-500/5 -z-10" />
        <div className="max-w-4xl mx-auto">
          <h2 className="text-6xl md:text-8xl font-black text-white mb-12 tracking-tighter">
            READY TO LEVEL UP?
          </h2>
          <button
            onClick={onEnterApp}
            className="px-16 py-6 bg-white text-slate-950 font-black rounded-3xl text-2xl hover:bg-cyan-400 transition-all hover:scale-110 shadow-[0_0_50px_rgba(255,255,255,0.2)]"
          >
            JOIN THE UNIVERSE
          </button>
          <div className="mt-12 flex items-center justify-center gap-8">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://picsum.photos/seed/${i}/100`}
                  className="w-12 h-12 rounded-full border-4 border-slate-950"
                  alt="User"
                />
              ))}
            </div>
            <div className="text-left">
              <div className="text-white font-bold">50,000+ Explorers</div>
              <div className="text-slate-500 text-sm">
                Already learning in Questoria
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
              <Sparkles size={18} className="text-white" />
            </div>
            <span className="text-xl font-black tracking-tighter text-white">
              QUESTORIA
            </span>
          </div>
          <div className="flex gap-12 text-slate-500 text-sm font-bold uppercase tracking-widest">
            <a href="#" className="hover:text-white transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Contact
            </a>
          </div>
          <div className="text-slate-600 text-xs font-bold uppercase tracking-widest">
            © 2026 QUESTORIA INC. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
