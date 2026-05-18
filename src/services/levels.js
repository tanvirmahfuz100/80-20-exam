const LEVELS_KEY = 'exam_levels_progress';
const USER_STATS_KEY = 'exam_user_stats';
const CHALLENGES_KEY = 'exam_challenges';

const readStorage = (key, fallback = {}) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, data) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export function computeLevels(normalizedQuestions) {
  if (!normalizedQuestions || normalizedQuestions.length === 0) return [];

  const hasPassages = normalizedQuestions.some(q => q.passage && q.blankId);
  const hasSubTables = normalizedQuestions.some(q => q._type === 'substitution_table');
  const isSingleType = !hasPassages && !hasSubTables;

  if (hasPassages) {
    const groups = [];
    let currentGroup = null;

    for (const q of normalizedQuestions) {
      if (!currentGroup || q.passage !== currentGroup.passage) {
        currentGroup = { passage: q.passage, questions: [q] };
        groups.push(currentGroup);
      } else {
        currentGroup.questions.push(q);
      }
    }

    const levels = [];
    for (let i = 0; i < groups.length; i += 2) {
      const slice = groups.slice(i, i + 2);
      levels.push({
        levelNumber: levels.length + 1,
        questions: slice.flatMap(g => g.questions),
        type: 'passage',
        passageCount: slice.length,
      });
    }
    return levels;
  }

  if (isSingleType) {
    const GROUP_SIZE = 7;
    const levels = [];
    for (let i = 0; i < normalizedQuestions.length; i += GROUP_SIZE) {
      levels.push({
        levelNumber: levels.length + 1,
        questions: normalizedQuestions.slice(i, i + GROUP_SIZE),
        type: 'single',
      });
    }
    return levels;
  }

  return [{ levelNumber: 1, questions: normalizedQuestions, type: 'mixed' }];
}

export function computeQuestionCountPerLevel(levels) {
  return levels.map(l => ({ levelNumber: l.levelNumber, count: l.questions.length }));
}

export function getLevelProgress(userId, chapterId) {
  const all = readStorage(LEVELS_KEY, {});
  return all[`${userId}_${chapterId}`] || { levels: {} };
}

export function saveLevelProgress(userId, chapterId, levelNumber, data) {
  const all = readStorage(LEVELS_KEY, {});
  const key = `${userId}_${chapterId}`;
  if (!all[key]) all[key] = { levels: {} };
  all[key].levels[String(levelNumber)] = { ...all[key].levels[String(levelNumber)], ...data };
  writeStorage(LEVELS_KEY, all);
}

export function isLevelUnlocked(levelNumber, progress) {
  if (levelNumber === 1) return true;
  const prev = progress.levels[String(levelNumber - 1)];
  return prev?.completed === true;
}

export function getUserStats(userId) {
  const all = readStorage(USER_STATS_KEY, {});
  return all[userId] || { total_xp: 0, total_stars: 0 };
}

export function updateUserStats(userId, updates) {
  const all = readStorage(USER_STATS_KEY, {});
  if (!all[userId]) all[userId] = { total_xp: 0, total_stars: 0 };
  all[userId] = { ...all[userId], ...updates };
  writeStorage(USER_STATS_KEY, all);
  return all[userId];
}

export function addXp(userId, amount) {
  const stats = getUserStats(userId);
  stats.total_xp = (stats.total_xp || 0) + amount;
  return updateUserStats(userId, stats);
}

export function addStars(userId, amount) {
  const stats = getUserStats(userId);
  stats.total_stars = (stats.total_stars || 0) + amount;
  return updateUserStats(userId, stats);
}

export function getChallengeState() {
  return readStorage(CHALLENGES_KEY, { daily: null, weekly: null });
}

export function getDailyChallengeKey() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return utc6.toISOString().split('T')[0];
}

export function getWeeklyChallengeKey() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const day = utc6.getUTCDay();
  const diff = utc6.getUTCDate() - day;
  const sunday = new Date(Date.UTC(utc6.getUTCFullYear(), utc6.getUTCMonth(), diff));
  return sunday.toISOString().split('T')[0];
}

export function setDailyChallenge(config) {
  const challenges = getChallengeState();
  challenges.daily = { date: getDailyChallengeKey(), ...config };
  writeStorage(CHALLENGES_KEY, challenges);
}

export function setWeeklyChallenge(config) {
  const challenges = getChallengeState();
  challenges.weekly = { weekStart: getWeeklyChallengeKey(), ...config };
  writeStorage(CHALLENGES_KEY, challenges);
}

export function completeDailyChallenge(userId) {
  const challenges = getChallengeState();
  if (challenges.daily && challenges.daily.date === getDailyChallengeKey() && !challenges.daily.completed) {
    challenges.daily.completed = true;
    addXp(userId, 50);
    writeStorage(CHALLENGES_KEY, challenges);
  }
}

export function advanceWeeklyChallenge(userId, sectionId) {
  const challenges = getChallengeState();
  if (challenges.weekly && challenges.weekly.weekStart === getWeeklyChallengeKey()) {
    if (!challenges.weekly.completedLevels) challenges.weekly.completedLevels = [];
    if (!challenges.weekly.completedLevels.includes(sectionId)) {
      challenges.weekly.completedLevels.push(sectionId);
      const totalLevels = challenges.weekly.totalLevels || 1;
      if (challenges.weekly.completedLevels.length >= totalLevels) {
        challenges.weekly.completed = true;
        addXp(userId, 200);
      }
      writeStorage(CHALLENGES_KEY, challenges);
    }
  }
}
