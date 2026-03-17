import "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";
import rateLimit from "express-rate-limit";
import { connectDB } from "./config/db.js";
import { initFirebaseAdmin } from "./config/firebaseAdmin.js";
import { seedAdmin } from "./utils/seedAdmin.js";
import { seedPlatformData } from "./utils/seedPlatformData.js";

import authRoutes from "./routes/authRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import contestRoutes from "./routes/contestRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import communityRoutes from "./routes/communityRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import interviewRoutes from "./routes/interviewRoutes.js";
import gamificationRoutes from "./routes/gamificationRoutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";

const app = express();

const configuredOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((o) => o.trim())
  .filter(Boolean);
const defaultDevOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
  "http://localhost:4173",
];
const allowedOrigins = new Set(
  configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins,
);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many requests, please try again later." },
});

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 90,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "AI rate limit reached, please retry shortly." },
});

app.use("/api", apiLimiter);

app.get("/health", (_req, res) =>
  res.json({ ok: true, service: "questoria-api" }),
);

app.use("/api/auth", authRoutes);
app.use("/api/problems", problemRoutes);
app.use("/api/contests", contestRoutes);
app.use("/api/leaderboards", leaderboardRoutes);
app.use("/api/community", communityRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/user", profileRoutes);
app.use("/api/ai", aiLimiter, aiRoutes);
app.use("/api/interview", aiLimiter, interviewRoutes);
app.use("/api/gamification", gamificationRoutes);
app.use("/api/resume", aiLimiter, resumeRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  return res
    .status(500)
    .json({ message: err.message || "Internal Server Error" });
});

const PORT = Number(process.env.PORT || 5000);

async function start() {
  await connectDB(process.env.MONGODB_URI);
  initFirebaseAdmin();
  await seedAdmin();
  await seedPlatformData();

  const server = http.createServer(app);

  await new Promise((resolve, reject) => {
    server.once("error", (err) => {
      if (err?.code === "EADDRINUSE") {
        // eslint-disable-next-line no-console
        console.warn(
          `⚠️ Port ${PORT} is already in use. Another Questoria backend instance may already be running.`,
        );
        // eslint-disable-next-line no-console
        console.warn(
          "Tip: stop the existing process on port 5000 before starting a new one.",
        );
        resolve();
        return;
      }
      reject(err);
    });

    server.listen(PORT, () => {
      // eslint-disable-next-line no-console
      console.log(`🚀 Questoria API listening on http://localhost:${PORT}`);
      resolve();
    });
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to initialize backend:", err);
  process.exit(1);
});
