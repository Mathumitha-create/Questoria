export const REWARD_POINTS = {
  problem_solved: 10,
  daily_login: 5,
  mock_interview_completed: 20,
};

export const BADGE_RULES = [
  {
    key: "First Problem Solved",
    check: (user) => Number(user.problemsSolved || 0) >= 1,
  },
  {
    key: "7-Day Streak",
    check: (user) => Number(user.streak || 0) >= 7,
  },
  {
    key: "Interview Master",
    check: (user) => Number(user.interviewsCompleted || 0) >= 5,
  },
  {
    key: "100 Problems Solved",
    check: (user) => Number(user.problemsSolved || 0) >= 100,
  },
];

const LEVELS = [
  { min: 0, title: "Beginner" },
  { min: 250, title: "Intermediate" },
  { min: 700, title: "Advanced" },
  { min: 1400, title: "Pro" },
];

function getWeekStartUTC(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  const day = d.getUTCDay();
  const diff = (day + 6) % 7;
  d.setUTCDate(d.getUTCDate() - diff);
  return d;
}

function computeLevelTitle(xp) {
  let title = LEVELS[0].title;
  for (const lvl of LEVELS) {
    if (xp >= lvl.min) {
      title = lvl.title;
    }
  }
  return title;
}

function isSameUTCDate(a, b) {
  if (!a || !b) return false;
  return (
    a.getUTCFullYear() === b.getUTCFullYear() &&
    a.getUTCMonth() === b.getUTCMonth() &&
    a.getUTCDate() === b.getUTCDate()
  );
}

function isYesterdayUTC(lastDate, now = new Date()) {
  if (!lastDate) return false;
  const d1 = new Date(now);
  d1.setUTCHours(0, 0, 0, 0);
  const d0 = new Date(lastDate);
  d0.setUTCHours(0, 0, 0, 0);
  const diff = d1.getTime() - d0.getTime();
  return diff === 24 * 60 * 60 * 1000;
}

export function applyRewardToUser(user, action, metadata = {}) {
  const now = new Date();
  const points = Number(metadata.pointsOverride ?? REWARD_POINTS[action] ?? 0);

  if (!Number.isFinite(points) || points < 0) {
    throw new Error("Invalid reward points");
  }

  const weekStart = getWeekStartUTC(now);
  const previousWeekStart = user.weeklyCycleStart
    ? getWeekStartUTC(user.weeklyCycleStart)
    : null;

  if (
    !previousWeekStart ||
    previousWeekStart.getTime() !== weekStart.getTime()
  ) {
    user.weeklyPoints = 0;
    user.weeklyCycleStart = weekStart;
  }

  if (action === "daily_login") {
    const lastActive = user.lastActiveAt ? new Date(user.lastActiveAt) : null;
    if (lastActive && isSameUTCDate(lastActive, now)) {
      return {
        pointsAdded: 0,
        updated: false,
        reason: "Daily login already rewarded today",
      };
    }

    if (isYesterdayUTC(lastActive, now)) {
      user.streak = Number(user.streak || 0) + 1;
    } else {
      user.streak = 1;
    }

    user.dailyLogins = Number(user.dailyLogins || 0) + 1;
    user.lastActiveAt = now;
  }

  if (action === "problem_solved") {
    user.problemsSolved = Number(user.problemsSolved || 0) + 1;
    user.lastActiveAt = now;
  }

  if (action === "mock_interview_completed") {
    user.interviewsCompleted = Number(user.interviewsCompleted || 0) + 1;
    user.lastActiveAt = now;
  }

  user.points = Number(user.points || 0) + points;
  user.bonusPoints = Number(user.bonusPoints || 0) + points;
  user.xpPoints = Number(user.xpPoints || 0) + points;
  user.weeklyPoints = Number(user.weeklyPoints || 0) + points;

  const computedLevel = Math.max(
    1,
    Math.floor(Number(user.xpPoints || 0) / 500) + 1,
  );
  user.level = computedLevel;
  user.levelTitle = computeLevelTitle(Number(user.xpPoints || 0));

  const existingBadges = new Set(user.badges || []);
  for (const rule of BADGE_RULES) {
    if (rule.check(user)) {
      existingBadges.add(rule.key);
    }
  }
  user.badges = Array.from(existingBadges);

  return {
    pointsAdded: points,
    updated: true,
    action,
    level: user.level,
    levelTitle: user.levelTitle,
    streak: user.streak,
    badges: user.badges,
  };
}
