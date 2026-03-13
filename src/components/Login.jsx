import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ArrowLeft,
  Sword,
  Brain,
  Trophy,
  Zap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  UserPlus,
  LogIn,
} from "lucide-react";
import { signInWithGoogle, loginWithEmail, signUpWithEmail } from "../firebase";

const ORBS = [
  { size: 420, x: "10%", y: "15%", color: "rgba(34,211,238,0.18)", delay: 0 },
  { size: 320, x: "70%", y: "60%", color: "rgba(168,85,247,0.18)", delay: 1.5 },
  { size: 200, x: "55%", y: "10%", color: "rgba(236,72,153,0.13)", delay: 3 },
];

const FLOATING_ICONS = [
  {
    Icon: Sword,
    top: "12%",
    left: "8%",
    delay: 0,
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
  },
  {
    Icon: Brain,
    top: "70%",
    left: "6%",
    delay: 0.8,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  {
    Icon: Trophy,
    top: "20%",
    right: "7%",
    delay: 1.4,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    Icon: Zap,
    top: "75%",
    right: "9%",
    delay: 2.1,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
];

const PARTICLES = Array.from({ length: 18 }, (_, i) => ({
  id: i,
  x: `${5 + Math.random() * 90}%`,
  y: `${5 + Math.random() * 90}%`,
  size: 2 + Math.random() * 3,
  duration: 3 + Math.random() * 4,
  delay: Math.random() * 4,
}));

export function Login({ onBack }) {
  const [mode, setMode] = useState("signin"); // 'signin' | 'signup'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      if (mode === "signup") {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      const msg =
        err.code === "auth/user-not-found"
          ? "No account found. Sign up instead."
          : err.code === "auth/wrong-password"
            ? "Incorrect password."
            : err.code === "auth/email-already-in-use"
              ? "Email already in use. Sign in instead."
              : err.code === "auth/invalid-email"
                ? "Invalid email address."
                : err.message;
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const switchMode = (m) => {
    setMode(m);
    setError("");
    setPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Animated background orbs */}
      {ORBS.map((orb, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: orb.size,
            height: orb.size,
            left: orb.x,
            top: orb.y,
            background: orb.color,
            filter: "blur(80px)",
          }}
          animate={{ scale: [1, 1.15, 1], opacity: [0.7, 1, 0.7] }}
          transition={{
            duration: 6 + i,
            delay: orb.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating particles */}
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-white/20 pointer-events-none"
          style={{ left: p.x, top: p.y, width: p.size, height: p.size }}
          animate={{ y: [0, -30, 0], opacity: [0, 1, 0] }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* Floating feature icons */}
      {FLOATING_ICONS.map(({ Icon, top, left, right, delay, color, bg }, i) => (
        <motion.div
          key={i}
          className={`absolute hidden lg:flex w-14 h-14 rounded-2xl ${bg} border border-white/10 items-center justify-center backdrop-blur-sm`}
          style={{ top, left, right }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1, y: [0, -12, 0] }}
          transition={{
            opacity: { delay, duration: 0.5 },
            scale: { delay, duration: 0.5 },
            y: { duration: 4 + i, delay, repeat: Infinity, ease: "easeInOut" },
          }}
        >
          <Icon size={24} className={color} />
        </motion.div>
      ))}

      {/* Back button */}
      {onBack && (
        <motion.button
          onClick={onBack}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="absolute top-8 left-8 flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-bold text-sm uppercase tracking-widest group"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />{" "}
          Back
        </motion.button>
      )}

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        {/* Card glow border */}
        <div className="absolute -inset-[1px] rounded-[44px] bg-gradient-to-br from-cyan-500/40 via-purple-500/20 to-pink-500/30 blur-sm" />
        <div className="relative bg-slate-900/80 border border-white/10 p-10 rounded-[40px] backdrop-blur-2xl shadow-[0_32px_80px_rgba(0,0,0,0.6)]">
          {/* Shimmer top bar */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-[2px] rounded-full bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />

          {/* Logo */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200,
              damping: 14,
            }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl blur-xl opacity-60 scale-110" />
              <div className="relative w-20 h-20 bg-gradient-to-br from-cyan-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
                <Sparkles size={38} className="text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-center mb-2"
          >
            <h1 className="text-5xl font-black text-white tracking-tighter mb-1">
              {mode === "signup" ? "JOIN QUESTORIA" : "QUESTORIA"}
            </h1>
            <div className="flex items-center justify-center gap-2 text-cyan-400 text-xs font-black uppercase tracking-[0.25em]">
              <span className="w-8 h-[1px] bg-cyan-400/40" />
              {mode === "signup"
                ? "Create your account"
                : "Level Up Your Skills"}
              <span className="w-8 h-[1px] bg-cyan-400/40" />
            </div>
          </motion.div>

          {/* Google Sign In */}
          <motion.button
            onClick={signInWithGoogle}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45, duration: 0.4 }}
            whileHover={{
              scale: 1.02,
              boxShadow: "0 0 28px rgba(34,211,238,0.3)",
            }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full mt-6 py-3.5 rounded-2xl font-black text-slate-950 text-sm overflow-hidden flex items-center justify-center gap-3 transition-all bg-white hover:bg-cyan-400"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#1e293b"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#1e293b"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                fill="#1e293b"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#1e293b"
              />
            </svg>
            Continue with Google
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-[1px] bg-white/10" />
            <span className="text-slate-600 text-xs font-bold tracking-widest uppercase">
              or {mode === "signup" ? "sign up" : "sign in"} with email
            </span>
            <div className="flex-1 h-[1px] bg-white/10" />
          </div>

          {/* Email/Password Form */}
          <motion.form
            onSubmit={handleEmailAuth}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="space-y-3"
          >
            {/* Email */}
            <div className="relative group">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/60 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 text-sm outline-none transition-all focus:bg-white/8 focus:shadow-[0_0_16px_rgba(34,211,238,0.15)]"
              />
            </div>

            {/* Password */}
            <div className="relative group">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-cyan-400 transition-colors"
              />
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder="Password"
                className="w-full bg-white/5 border border-white/10 focus:border-cyan-500/60 rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-600 text-sm outline-none transition-all focus:bg-white/8 focus:shadow-[0_0_16px_rgba(34,211,238,0.15)]"
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            {/* Confirm Password (signup only) */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.25 }}
                  className="relative group overflow-hidden"
                >
                  <Lock
                    size={16}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-400 transition-colors"
                  />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    placeholder="Confirm password"
                    className="w-full bg-white/5 border border-white/10 focus:border-purple-500/60 rounded-xl py-3 pl-10 pr-11 text-white placeholder-slate-600 text-sm outline-none transition-all focus:bg-white/8 focus:shadow-[0_0_16px_rgba(168,85,247,0.15)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs font-bold bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{
                scale: loading ? 1 : 1.02,
                boxShadow: "0 0 28px rgba(34,211,238,0.4)",
              }}
              whileTap={{ scale: 0.97 }}
              className="relative w-full py-3.5 rounded-2xl font-black text-slate-950 text-sm overflow-hidden flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{
                background:
                  mode === "signup"
                    ? "linear-gradient(135deg, #a78bfa 0%, #f472b6 100%)"
                    : "linear-gradient(135deg, #22d3ee 0%, #a78bfa 100%)",
              }}
            >
              <motion.span
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent skew-x-[-20deg]"
                animate={{ x: ["-150%", "200%"] }}
                transition={{
                  duration: 2.2,
                  repeat: Infinity,
                  repeatDelay: 1.8,
                  ease: "easeInOut",
                }}
              />
              <span className="relative flex items-center gap-2">
                {loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : mode === "signup" ? (
                  <UserPlus size={16} />
                ) : (
                  <LogIn size={16} />
                )}
                {loading
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create Account"
                    : "Sign In"}
              </span>
            </motion.button>
          </motion.form>

          {/* Switch mode link */}
          <p className="mt-5 text-center text-sm text-slate-500">
            {mode === "signin" ? (
              <>
                New to Questoria?{" "}
                <button
                  onClick={() => switchMode("signup")}
                  className="text-cyan-400 font-black hover:text-cyan-300 transition-colors underline underline-offset-2"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => switchMode("signin")}
                  className="text-cyan-400 font-black hover:text-cyan-300 transition-colors underline underline-offset-2"
                >
                  Sign In
                </button>
              </>
            )}
          </p>

          <p className="mt-3 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
            By entering, you agree to the Terms of Questoria
          </p>
        </div>
      </motion.div>
    </div>
  );
}
