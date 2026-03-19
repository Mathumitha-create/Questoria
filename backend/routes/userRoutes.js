import { Router } from "express";
import {
  completeLesson,
  getDashboard,
  getLeaderboard,
  getLearningModules,
  streamLeaderboard,
  submitChallenge,
  submitQuiz,
  updateProfile,
} from "../controllers/userController.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

router.get("/dashboard", requireAuth, getDashboard);
router.get("/modules", requireAuth, getLearningModules);
router.get("/leaderboard", requireAuth, getLeaderboard);
router.get("/leaderboard/stream", requireAuth, streamLeaderboard);
router.post("/lessons/:id/complete", requireAuth, completeLesson);
router.post("/quizzes/:id/submit", requireAuth, submitQuiz);
router.post("/challenges/:id/submit", requireAuth, submitChallenge);
router.put("/profile", requireAuth, updateProfile);

export default router;
