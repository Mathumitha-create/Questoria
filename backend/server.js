import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { initializeDatabase } from "./models/db.js";
import adminRoutes from "./routes/adminRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";

dotenv.config();
initializeDatabase();

const app = express();
const DEFAULT_PORT = Number(process.env.PORT || 4000);
const ALLOW_PORT_FALLBACK =
  String(process.env.ALLOW_PORT_FALLBACK || "true").toLowerCase() === "true";
const MAX_PORT_RETRIES = Number(process.env.MAX_PORT_RETRIES || 10);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_, res) =>
  res.json({ ok: true, service: "questoria-api" }),
);

app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  // eslint-disable-next-line no-console
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

function startServer(port, attempt = 0) {
  const server = app
    .listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`Questoria backend running on http://localhost:${port}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        if (ALLOW_PORT_FALLBACK && attempt < MAX_PORT_RETRIES) {
          const nextPort = port + 1;
          // eslint-disable-next-line no-console
          console.warn(`Port ${port} is busy. Retrying on ${nextPort}...`);
          return startServer(nextPort, attempt + 1);
        }

        // eslint-disable-next-line no-console
        console.error(
          `Port ${port} is already in use. Stop the process using that port or change PORT in .env.`,
        );
        process.exit(1);
      }

      // eslint-disable-next-line no-console
      console.error("Server startup error:", err);
      process.exit(1);
    });

  return server;
}

startServer(DEFAULT_PORT);
