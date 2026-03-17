import { Submission } from "../models/Submission.js";
import { User } from "../models/User.js";

const XP_BY_DIFFICULTY = {
  Easy: 50,
  Medium: 100,
  Hard: 150,
};

function computeStreakFromDates(dateKeys) {
  if (!dateKeys.length) return 0;

  const set = new Set(dateKeys);
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);

  let streak = 0;
  while (true) {
    const key = d.toISOString().slice(0, 10);
    if (!set.has(key)) break;
    streak += 1;
    d.setUTCDate(d.getUTCDate() - 1);
  }

  return streak;
}

function buildBadges({ problemsSolved, streak, contestAcceptedCount }) {
  const badges = [];

  if (problemsSolved >= 1) badges.push("First Blood");
  if (problemsSolved >= 10) badges.push("Problem Hunter");
  if (problemsSolved >= 25) badges.push("Code Gladiator");
  if (problemsSolved >= 50) badges.push("Quest Veteran");
  if (streak >= 3) badges.push("On Fire");
  if (streak >= 7) badges.push("Streak Master");
  if (contestAcceptedCount >= 1) badges.push("Contest Challenger");
  if (contestAcceptedCount >= 10) badges.push("Arena Dominator");

  return badges;
}

export async function recalculateUserProgress(userId) {
  const existingUser = await User.findById(userId).select(
    "bonusPoints badges streak",
  );
  if (!existingUser) return null;

  const accepted = await Submission.find({ user: userId, passed: true })
    .populate("problem", "difficulty")
    .select("problem contest createdAt")
    .sort({ createdAt: 1 });

  const solvedByProblem = new Map();
  const solvedDateKeys = new Set();
  const contestAcceptedPairs = new Set();
  const contestsParticipated = new Set();

  for (const s of accepted) {
    const problemId = s.problem?._id?.toString();
    const difficulty = s.problem?.difficulty || "Easy";

    if (problemId && !solvedByProblem.has(problemId)) {
      solvedByProblem.set(problemId, difficulty);
    }

    if (s.createdAt) {
      solvedDateKeys.add(new Date(s.createdAt).toISOString().slice(0, 10));
    }

    if (s.contest) {
      const contestId = s.contest.toString();
      contestsParticipated.add(contestId);
      if (problemId) {
        contestAcceptedPairs.add(`${contestId}:${problemId}`);
      }
    }
  }

  let xp = 0;
  for (const difficulty of solvedByProblem.values()) {
    xp += XP_BY_DIFFICULTY[difficulty] || XP_BY_DIFFICULTY.Easy;
  }

  const contestAcceptedCount = contestAcceptedPairs.size;
  xp += contestAcceptedCount * 25;

  const problemsSolved = solvedByProblem.size;
  const bonusPoints = Number(existingUser.bonusPoints || 0);
  xp += bonusPoints;

  const level = Math.max(1, Math.floor(xp / 500) + 1);
  const solvedSubmissionStreak = computeStreakFromDates(
    Array.from(solvedDateKeys),
  );
  const streak = Math.max(
    Number(existingUser.streak || 0),
    solvedSubmissionStreak,
  );
  const contestRating =
    1200 + contestAcceptedCount * 8 + contestsParticipated.size * 20;
  const badges = Array.from(
    new Set([
      ...(existingUser.badges || []),
      ...buildBadges({ problemsSolved, streak, contestAcceptedCount }),
    ]),
  );

  await User.findByIdAndUpdate(userId, {
    points: xp,
    xpPoints: xp,
    level,
    streak,
    problemsSolved,
    contestRating,
    badges,
  });

  return {
    xp,
    level,
    streak,
    problemsSolved,
    contestRating,
    badges,
  };
}
