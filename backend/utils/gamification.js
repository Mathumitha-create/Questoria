export const XP_REWARDS = {
  lesson: 10,
  quiz: 20,
  challenge: 50,
};

export const LEVEL_STEP = 100;

export function levelFromXp(xp) {
  return Math.max(1, Math.floor(xp / LEVEL_STEP) + 1);
}

export function getUnlockedBadges({
  xp,
  quizzesCompleted,
  challengesCompleted,
}) {
  const badges = [];

  if (xp >= 100) badges.push("Beginner");
  if (challengesCompleted >= 2) badges.push("Problem Solver");
  if (quizzesCompleted >= 3) badges.push("Quiz Master");
  if (challengesCompleted >= 5 && xp >= 500) badges.push("Coding Ninja");

  return badges;
}

export function uniqueMerge(items = [], extra = []) {
  return [...new Set([...(items || []), ...(extra || [])])];
}
