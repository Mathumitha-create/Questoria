import { Router } from "express";
import {
  addChallenge,
  addLesson,
  addQuiz,
  adminLeaderboard,
  listUsers,
} from "../controllers/adminController.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";

const router = Router();

router.use(requireAuth, requireAdmin);
router.get("/users", listUsers);
router.get("/leaderboard", adminLeaderboard);
router.post("/lessons", addLesson);
router.post("/quizzes", addQuiz);
router.post("/challenges", addChallenge);

export default router;
