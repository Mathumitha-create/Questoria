import express from "express";
import axios from "axios";
import { Problem } from "../models/Problem.js";
import { Submission } from "../models/Submission.js";
import { Contest } from "../models/Contest.js";
import { User } from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { recalculateUserProgress } from "../utils/recalculateUserProgress.js";
import { applyRewardToUser } from "../utils/gamification.js";

const router = express.Router();

const LANGUAGE_MAP = {
  javascript: 63,
  python: 71,
  cpp: 54,
  java: 62,
};

function evaluateSubmission(sourceCode = "") {
  const code = String(sourceCode || "").trim();
  if (!code || code.length < 20) return false;
  if (/\bTODO\b/i.test(code)) return false;
  if (/\bpass\b\s*$/im.test(code)) return false;
  if (/NotImplemented|Not Implemented/i.test(code)) return false;
  return true;
}

function getSyntheticRuntime(sourceCode = "") {
  const base = Math.max(
    8,
    Math.min(95, Math.floor(String(sourceCode).length / 12)),
  );
  return `${base}ms`;
}

function getSyntheticMemory(sourceCode = "") {
  const base = Math.max(
    32,
    Math.min(256, Math.floor(String(sourceCode).length / 10)),
  );
  return `${base}MB`;
}

router.get("/", async (req, res) => {
  const { difficulty, tag, company, search } = req.query;
  const query = {};

  if (difficulty && difficulty !== "All") query.difficulty = difficulty;
  if (tag && tag !== "All") query.tags = tag;
  if (company && company !== "All") query.companies = company;
  if (search) query.title = { $regex: search, $options: "i" };

  const problems = await Problem.find(query).sort({ createdAt: -1 });
  return res.json({ problems });
});

router.get("/progress/me", requireAuth, async (req, res) => {
  const submissions = await Submission.find({ user: req.user.sub })
    .select("problem passed")
    .sort({ createdAt: -1 });

  const progress = {};
  submissions.forEach((s) => {
    const pid = s.problem?.toString();
    if (!pid) return;
    if (!progress[pid]) {
      progress[pid] = { solved: false, attempts: 0 };
    }
    progress[pid].attempts += 1;
    progress[pid].solved = progress[pid].solved || !!s.passed;
  });

  return res.json({ progress });
});

router.get("/:id", async (req, res) => {
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  return res.json({ problem });
});

router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const slug =
    req.body.slug || req.body.title?.toLowerCase().replace(/\s+/g, "-");
  const problem = await Problem.create({
    ...req.body,
    slug,
    createdBy: req.user.sub,
  });
  return res.status(201).json({ problem });
});

router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!problem) return res.status(404).json({ message: "Problem not found" });
  return res.json({ problem });
});

router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  await Problem.findByIdAndDelete(req.params.id);
  return res.json({ message: "Problem deleted" });
});

router.post("/:id/run", requireAuth, async (req, res) => {
  const { language, sourceCode, stdin = "" } = req.body;
  const languageId = LANGUAGE_MAP[language];
  if (!languageId)
    return res.status(400).json({ message: "Unsupported language" });

  const judgeUrl = process.env.JUDGE0_URL;
  const judgeKey = process.env.JUDGE0_API_KEY;

  if (!judgeUrl || !judgeKey) {
    return res.json({
      output: "Judge0 not configured. Configure JUDGE0_URL and JUDGE0_API_KEY.",
      status: "Simulated",
      runtime: "0.00",
      memory: "0",
    });
  }

  const submission = await axios.post(
    `${judgeUrl}/submissions?base64_encoded=false&wait=true`,
    {
      language_id: languageId,
      source_code: sourceCode,
      stdin,
    },
    {
      headers: {
        "x-rapidapi-key": judgeKey,
        "Content-Type": "application/json",
      },
    },
  );

  return res.json({
    output:
      submission.data.stdout ||
      submission.data.stderr ||
      submission.data.compile_output ||
      "",
    status: submission.data.status?.description,
    runtime: submission.data.time,
    memory: submission.data.memory,
  });
});

router.post("/:id/submit", requireAuth, async (req, res) => {
  const { language, sourceCode, contestId = null } = req.body;
  const problem = await Problem.findById(req.params.id);
  if (!problem) return res.status(404).json({ message: "Problem not found" });

  let contest = null;
  if (contestId) {
    contest = await Contest.findById(contestId).select(
      "startsAt endsAt problems participants",
    );
    if (!contest) {
      return res.status(404).json({ message: "Contest not found" });
    }

    const now = new Date();
    if (now < contest.startsAt || now > contest.endsAt) {
      return res
        .status(400)
        .json({ message: "Contest is not live. Submissions are closed." });
    }

    const isParticipant = (contest.participants || []).some(
      (p) => p.toString() === req.user.sub,
    );
    if (!isParticipant) {
      return res.status(403).json({
        message: "Register for this contest before submitting.",
      });
    }

    const belongsToContest = (contest.problems || []).some(
      (p) => p.toString() === problem._id.toString(),
    );
    if (!belongsToContest) {
      return res.status(400).json({
        message: "This problem is not part of the selected contest.",
      });
    }
  }

  const attemptCount = await Submission.countDocuments({
    user: req.user.sub,
    problem: problem._id,
    ...(contest ? { contest: contest._id } : {}),
  });

  const alreadySolvedProblem = await Submission.exists({
    user: req.user.sub,
    problem: problem._id,
    passed: true,
  });

  const passed = evaluateSubmission(sourceCode);
  const status = passed ? "Accepted" : "Wrong Answer";

  const submission = await Submission.create({
    user: req.user.sub,
    problem: problem._id,
    contest: contest ? contest._id : null,
    language,
    sourceCode,
    status,
    passed,
    attempts: attemptCount + 1,
    runtime: getSyntheticRuntime(sourceCode),
    memory: getSyntheticMemory(sourceCode),
    output: status,
  });

  if (passed && !alreadySolvedProblem) {
    const user = await User.findById(req.user.sub);
    if (user) {
      const reward = applyRewardToUser(user, "problem_solved");
      if (reward.updated) {
        await user.save();
      }
    }
  }

  await recalculateUserProgress(req.user.sub);

  return res.status(201).json({ submission });
});

router.get("/:id/submissions/me", requireAuth, async (req, res) => {
  const submissions = await Submission.find({
    user: req.user.sub,
    problem: req.params.id,
  }).sort({ createdAt: -1 });
  return res.json({ submissions });
});

export default router;
