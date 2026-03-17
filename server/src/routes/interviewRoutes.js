import express from "express";
import { requireAuth } from "../middleware/auth.js";
import { InterviewSession } from "../models/InterviewSession.js";
import { User } from "../models/User.js";
import {
  generateInterviewQuestions,
  evaluateInterviewAnswer,
} from "../utils/interviewAI.js";
import { applyRewardToUser } from "../utils/gamification.js";

const router = express.Router();

function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

router.post(
  "/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const type = String(req.body?.type || "dsa").toLowerCase();
    const difficulty = String(req.body?.difficulty || "easy").toLowerCase();

    if (!["dsa", "hr", "system-design"].includes(type)) {
      return res.status(400).json({ message: "Invalid interview type" });
    }

    if (!["easy", "medium", "hard"].includes(difficulty)) {
      return res.status(400).json({ message: "Invalid difficulty" });
    }

    const questions = await generateInterviewQuestions({
      type,
      difficulty,
      count: 3,
    });

    const session = await InterviewSession.create({
      userId: req.user.sub,
      type,
      difficulty,
      questions,
      answers: [],
      score: 0,
      feedback: "",
      status: "in-progress",
      currentQuestionIndex: 0,
      startedAt: new Date(),
    });

    return res.json({
      sessionId: session._id,
      type: session.type,
      difficulty: session.difficulty,
      currentQuestionIndex: session.currentQuestionIndex,
      question: session.questions[0] || null,
      totalQuestions: session.questions.length,
      startedAt: session.startedAt,
    });
  }),
);

router.post(
  "/answer",
  requireAuth,
  asyncHandler(async (req, res) => {
    const {
      sessionId,
      questionId,
      answerText = "",
      code = "",
      language = "javascript",
    } = req.body || {};

    if (!sessionId || !questionId) {
      return res
        .status(400)
        .json({ message: "sessionId and questionId are required" });
    }

    const session = await InterviewSession.findOne({
      _id: sessionId,
      userId: req.user.sub,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    if (session.status === "completed") {
      return res.status(400).json({ message: "Interview already completed" });
    }

    const question = session.questions.find((q) => q.questionId === questionId);
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    const existingIndex = session.answers.findIndex(
      (a) => a.questionId === questionId,
    );
    if (existingIndex >= 0) {
      return res
        .status(400)
        .json({ message: "Answer already submitted for this question" });
    }

    const evaluation = await evaluateInterviewAnswer({
      question: question.prompt,
      answerText,
      code,
      type: session.type,
      difficulty: session.difficulty,
    });

    session.answers.push({
      questionId,
      answerText,
      code,
      language,
      score: Number(evaluation.score || 0),
      feedback: evaluation.feedback,
      submittedAt: new Date(),
    });

    const totalScore =
      session.answers.reduce((acc, item) => acc + Number(item.score || 0), 0) /
      Math.max(1, session.questions.length);
    session.score = Math.round(totalScore);

    const answeredCount = session.answers.length;
    const nextQuestion = session.questions[answeredCount] || null;
    session.currentQuestionIndex = answeredCount;

    let reward = null;
    if (!nextQuestion || answeredCount >= session.questions.length) {
      session.status = "completed";
      session.completedAt = new Date();
      session.feedback =
        session.score >= 80
          ? "Excellent interview performance. Keep this consistency!"
          : session.score >= 60
            ? "Good work. Focus on deeper explanations and optimization."
            : "Solid attempt. Practice structured answers and core fundamentals.";

      const user = await User.findById(req.user.sub);
      if (user) {
        reward = applyRewardToUser(user, "mock_interview_completed");
        if (reward.updated) {
          await user.save();
        }
      }
    }

    await session.save();

    return res.json({
      sessionId: session._id,
      evaluation,
      score: session.score,
      status: session.status,
      nextQuestion,
      currentQuestionIndex: session.currentQuestionIndex,
      completed: session.status === "completed",
      reward,
    });
  }),
);

router.get(
  "/result/:sessionId",
  requireAuth,
  asyncHandler(async (req, res) => {
    const session = await InterviewSession.findOne({
      _id: req.params.sessionId,
      userId: req.user.sub,
    });

    if (!session) {
      return res.status(404).json({ message: "Interview session not found" });
    }

    return res.json({
      session,
      summary: {
        type: session.type,
        difficulty: session.difficulty,
        score: session.score,
        completedAt: session.completedAt,
        totalQuestions: session.questions.length,
        answeredQuestions: session.answers.length,
      },
    });
  }),
);

router.get(
  "/history",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await InterviewSession.find({ userId: req.user.sub })
      .select("type difficulty score status createdAt completedAt")
      .sort({ createdAt: -1 })
      .limit(30);

    return res.json({ history: sessions });
  }),
);

router.get(
  "/performance",
  requireAuth,
  asyncHandler(async (req, res) => {
    const sessions = await InterviewSession.find({
      userId: req.user.sub,
      status: "completed",
    })
      .select("type difficulty score completedAt createdAt")
      .sort({ createdAt: 1 })
      .limit(100);

    const graph = sessions.map((s, idx) => ({
      index: idx + 1,
      score: s.score,
      type: s.type,
      difficulty: s.difficulty,
      date: new Date(s.completedAt || s.createdAt).toISOString().slice(0, 10),
    }));

    return res.json({
      graph,
      stats: {
        total: sessions.length,
        averageScore:
          sessions.length > 0
            ? Math.round(
                sessions.reduce(
                  (acc, item) => acc + Number(item.score || 0),
                  0,
                ) / sessions.length,
              )
            : 0,
        bestScore:
          sessions.length > 0
            ? Math.max(...sessions.map((s) => Number(s.score || 0)))
            : 0,
      },
    });
  }),
);

export default router;
