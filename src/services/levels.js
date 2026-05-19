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
  const hasCreativeQuestions = normalizedQuestions.some(q => q._type === 'creative_question');
  const isSingleType = !hasPassages && !hasSubTables && !hasCreativeQuestions;

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

  if (hasCreativeQuestions && !hasPassages && !hasSubTables) {
    const GROUP_SIZE = 2;
    const levels = [];
    for (let i = 0; i < normalizedQuestions.length; i += GROUP_SIZE) {
      levels.push({
        levelNumber: levels.length + 1,
        questions: normalizedQuestions.slice(i, i + GROUP_SIZE),
        type: 'creative',
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
  return readStorage(CHALLENGES_KEY, { daily: [], weekly: null });
}

export function getDailyChallengeKey() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  return utc6.toISOString().split('T')[0];
}

export function getDailyChallengeExpiry() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const midnight = new Date(Date.UTC(utc6.getUTCFullYear(), utc6.getUTCMonth(), utc6.getUTCDate() + 1));
  const diffMs = midnight.getTime() - utc6.getTime();
  const hours = Math.floor(diffMs / 3600000);
  const minutes = Math.floor((diffMs % 3600000) / 60000);
  return { hours, minutes, totalMs: diffMs };
}

export function getWeeklyChallengeKey() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const day = utc6.getUTCDay();
  const diff = utc6.getUTCDate() - day;
  const sunday = new Date(Date.UTC(utc6.getUTCFullYear(), utc6.getUTCMonth(), diff));
  return sunday.toISOString().split('T')[0];
}

export function getWeeklyChallengeExpiry() {
  const now = new Date();
  const utc6 = new Date(now.getTime() + 6 * 60 * 60 * 1000);
  const day = utc6.getUTCDay();
  const nextSunday = new Date(Date.UTC(utc6.getUTCFullYear(), utc6.getUTCMonth(), utc6.getUTCDate() + (7 - day)));
  const diffMs = nextSunday.getTime() - utc6.getTime();
  const days = Math.floor(diffMs / 86400000);
  const hours = Math.floor((diffMs % 86400000) / 3600000);
  return { days, hours, totalMs: diffMs };
}

export function getDailyChallengesForExam(examId) {
  const challenges = getChallengeState();
  const today = getDailyChallengeKey();
  const active = (challenges.daily || []).filter(c => c.date === today);
  if (active.length > 0) return active;

  const sections = getExamSections(examId);
  if (sections.length === 0) return [];

  const selected = [];
  const shuffled = [...sections].sort(() => Math.random() - 0.5);
  const count = Math.min(3, shuffled.length);

  for (let i = 0; i < count; i++) {
    const section = shuffled[i];
    selected.push({
      date: today,
      id: `daily_${examId}_${i}`,
      label: section.label,
      file: section.file,
      chapterId: section.chapterId,
      levelNumber: 1,
      completed: false,
      bonusXp: 50,
    });
  }

  challenges.daily = [...(challenges.daily || []), ...selected];
  writeStorage(CHALLENGES_KEY, challenges);
  return selected;
}

export function getExamSections(examId) {
  const allChapters = {
    ssc: [
      { label: 'Gap Filling', file: 'ssc/english/gap_filling_with_clues_paper_11.json', chapterId: 'ssc_gap_filling' },
      { label: 'Changing Sentences', file: 'ssc/english/changing_sentences.json', chapterId: 'ssc_changing_sentences' },
      { label: 'Completing Sentences', file: 'ssc/english/completing_sentences.json', chapterId: 'ssc_completing_sentences' },
      { label: 'Substitution Table', file: 'ssc/english/substitution_table.json', chapterId: 'ssc_substitution_table' },
      { label: 'Narrative Style', file: 'ssc/english/right_form_of_verbs_and_narrative.json', chapterId: 'ssc_narrative' },
    ],
    hsc: [
      { label: 'Gap Filling', file: 'hsc/english/gap_filling.json', chapterId: 'hsc_gap_filling' },
      { label: 'Changing Sentences', file: 'hsc/english/changing_sentences.json', chapterId: 'hsc_changing_sentences' },
      { label: 'Completing Sentences', file: 'hsc/english/completing_sentences.json', chapterId: 'hsc_completing_sentences' },
      { label: 'Substitution Table', file: 'hsc/english/substitution_table.json', chapterId: 'hsc_substitution_table' },
    ],
    iba: [
      { label: 'English', file: 'iba/english/vocabulary.json', chapterId: 'iba_english' },
      { label: 'Math', file: 'iba/math/arithmetic.json', chapterId: 'iba_math' },
      { label: 'Analytical', file: 'iba/analytical/analytical.json', chapterId: 'iba_analytical' },
    ],
  };
  return allChapters[examId] || [];
}

export function completeDailyChallengeById(userId, challengeId) {
  const challenges = getChallengeState();
  const today = getDailyChallengeKey();
  const idx = (challenges.daily || []).findIndex(c => c.id === challengeId && c.date === today && !c.completed);
  if (idx !== -1) {
    challenges.daily[idx].completed = true;
    addXp(userId, challenges.daily[idx].bonusXp || 50);
    writeStorage(CHALLENGES_KEY, challenges);
    return true;
  }
  return false;
}

export function getWeeklyChallengeForExam(examId) {
  const challenges = getChallengeState();
  const weekStart = getWeeklyChallengeKey();
  if (challenges.weekly?.weekStart === weekStart) return challenges.weekly;

  const sections = getExamSections(examId);
  if (sections.length === 0) return null;

  const weekly = {
    weekStart,
    examId,
    label: `Full ${examId.toUpperCase()} Practice`,
    totalLevels: sections.length,
    completedLevels: [],
    completed: false,
    bonusXp: 200,
  };
  challenges.weekly = weekly;
  writeStorage(CHALLENGES_KEY, challenges);
  return weekly;
}

export function advanceWeeklyChallenge(userId, chapterId) {
  const challenges = getChallengeState();
  if (challenges.weekly && challenges.weekly.weekStart === getWeeklyChallengeKey()) {
    if (!challenges.weekly.completedLevels) challenges.weekly.completedLevels = [];
    if (!challenges.weekly.completedLevels.includes(chapterId)) {
      challenges.weekly.completedLevels.push(chapterId);
      if (challenges.weekly.completedLevels.length >= challenges.weekly.totalLevels) {
        challenges.weekly.completed = true;
        addXp(userId, challenges.weekly.bonusXp || 200);
      }
      writeStorage(CHALLENGES_KEY, challenges);
    }
  }
}
