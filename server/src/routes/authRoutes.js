import express from "express";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import axios from "axios";
import { User } from "../models/User.js";
import { signAccessToken } from "../utils/jwt.js";
import { requireAuth } from "../middleware/auth.js";
import { verifyFirebaseIdToken } from "../config/firebaseAdmin.js";

const router = express.Router();

function safeUser(user) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    profilePhoto: user.profilePhoto,
    xpPoints: user.xpPoints,
    level: user.level,
    badges: user.badges,
    rank: user.rank,
    streak: user.streak,
    problemsSolved: user.problemsSolved,
    contestRating: user.contestRating,
    role: user.role,
    isBanned: user.isBanned,
  };
}

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

async function verifyIdTokenWithFirebaseRest(idToken) {
  const webApiKey =
    process.env.FIREBASE_WEB_API_KEY || process.env.VITE_FIREBASE_API_KEY || "";
  if (!webApiKey) return null;

  const { data } = await axios.post(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${webApiKey}`,
    { idToken },
  );

  const account = data?.users?.[0];
  if (!account?.email) return null;

  return {
    email: account.email,
    name: account.displayName || account.email.split("@")[0],
    picture: account.photoUrl || "",
  };
}

router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  const normalizedEmail = normalizeEmail(email);
  const normalizedUsername = String(username || "").trim();

  if (!normalizedUsername || !normalizedEmail || !password) {
    return res
      .status(400)
      .json({ message: "username, email, and password are required" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters" });
  }

  const exists = await User.findOne({ email: normalizedEmail });
  if (exists) {
    if (exists.oauthProvider === "firebase-google" && !exists.password) {
      return res.status(409).json({
        message:
          "This email is already registered with Google. Please use 'Continue with Google'.",
      });
    }
    return res.status(409).json({ message: "Email already exists" });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({
    username: normalizedUsername,
    email: normalizedEmail,
    password: hashed,
  });

  const token = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  return res.status(201).json({ token, user: safeUser(user) });
});

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ message: "email and password are required" });

  const normalizedEmail = normalizeEmail(email);

  const user = await User.findOne({ email: normalizedEmail });
  if (!user) return res.status(401).json({ message: "Invalid credentials" });

  if (!user.password && user.oauthProvider === "firebase-google") {
    return res.status(401).json({
      message:
        "This account uses Google sign-in. Please click 'Continue with Google'.",
    });
  }

  if (!user.password)
    return res.status(401).json({ message: "Invalid credentials" });

  if (user.isBanned) return res.status(403).json({ message: "Account banned" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok) return res.status(401).json({ message: "Invalid credentials" });

  const token = signAccessToken({
    sub: user._id.toString(),
    role: user.role,
    email: user.email,
  });
  return res.json({ token, user: safeUser(user) });
});

router.post("/google", async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) return res.status(400).json({ message: "idToken is required" });

  try {
    let decoded;
    try {
      decoded = await verifyFirebaseIdToken(idToken);
    } catch {
      decoded = await verifyIdTokenWithFirebaseRest(idToken);
    }

    if (!decoded) {
      return res.status(401).json({
        message:
          "Invalid Google token or Firebase verification not configured. Set Firebase Admin credentials or FIREBASE_WEB_API_KEY/VITE_FIREBASE_API_KEY in server .env.",
      });
    }

    const email = decoded.email?.toLowerCase();
    if (!email)
      return res.status(400).json({ message: "Google token missing email" });

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        username: decoded.name || email.split("@")[0],
        email,
        profilePhoto: decoded.picture || "",
        oauthProvider: "firebase-google",
      });
    }

    if (user.isBanned)
      return res.status(403).json({ message: "Account banned" });

    const token = signAccessToken({
      sub: user._id.toString(),
      role: user.role,
      email: user.email,
    });
    return res.json({ token, user: safeUser(user) });
  } catch {
    return res.status(401).json({
      message: "Invalid Google token or Firebase verification not configured.",
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "email is required" });

  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    return res.json({
      message: "If an account exists, reset instructions were generated.",
    });
  }

  const resetToken = crypto.randomBytes(24).toString("hex");
  user.resetToken = resetToken;
  user.resetTokenExpiresAt = new Date(Date.now() + 1000 * 60 * 30);
  await user.save();

  // In production, email this link
  const resetLink = `${process.env.FRONTEND_URL || "http://localhost:3000"}/reset-password?token=${resetToken}`;
  return res.json({ message: "Password reset link generated", resetLink });
});

router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  if (!token || !password)
    return res.status(400).json({ message: "token and password are required" });

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiresAt: { $gt: new Date() },
  });

  if (!user)
    return res.status(400).json({ message: "Invalid or expired reset token" });

  user.password = await bcrypt.hash(password, 10);
  user.resetToken = null;
  user.resetTokenExpiresAt = null;
  await user.save();

  return res.json({ message: "Password updated" });
});

router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.sub);
  if (!user) return res.status(404).json({ message: "User not found" });
  return res.json({ user: safeUser(user) });
});

export default router;
