import { useMistakeStore } from '../stores/mistakeStore';

const MISTAKES_KEY = 'quiz_mistakes';
const REVIEW_SESSION_KEY = 'quiz_review_session';

export const REVIEW_INTERVALS = [
  { days: 0, label: 'Today', desc: 'Due now' },
  { days: 3, label: '3 Days', desc: 'Due in 3 days' },
  { days: 7, label: '7 Days', desc: 'Due in 7 days' },
  { days: 14, label: '14 Days', desc: 'Due in 14 days' },
  { days: 30, label: '30 Days', desc: 'Due in 30 days' },
];

const read = () => {
  try { return JSON.parse(localStorage.getItem(MISTAKES_KEY)!) || []; }
  catch { return []; }
};

const write = (data: unknown[]) => {
  localStorage.setItem(MISTAKES_KEY, JSON.stringify(data));
  const dueCount = getDueCount(data);
  localStorage.setItem('quiz_star_balance', String(dueCount));
  useMistakeStore.getState().updateMistakeCount(dueCount);
  useMistakeStore.getState().setStarBalance(dueCount);
  useMistakeStore.getState().notifyUpdate();
};

const getDueCount = (all) => {
  const now = new Date();
  return all.filter(m => new Date(m.nextReviewAt) <= now).length;
};

export const addMistake = (questionKey, question, source) => {
  const all = read();
  const existing = all.find(m => m.id === questionKey);

  if (existing) {
    existing.stage = 0;
    existing.nextReviewAt = new Date().toISOString();
    existing.lastWrongAt = new Date().toISOString();
    existing.question = question;
    existing.source = source || {};
  } else {
    all.push({
      id: questionKey,
      question,
      stage: 0,
      nextReviewAt: new Date().toISOString(),
      lastWrongAt: new Date().toISOString(),
      source: source || {},
    });
  }

  write(all);
};

export const advanceStage = (questionKey) => {
  const all = read();
  const m = all.find(x => x.id === questionKey);
  if (!m) return;

  m.stage = Math.min(m.stage + 1, REVIEW_INTERVALS.length - 1);

  if (m.stage === REVIEW_INTERVALS.length - 1) {
    const idx = all.indexOf(m);
    all.splice(idx, 1);
  } else {
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + REVIEW_INTERVALS[m.stage].days);
    m.nextReviewAt = nextDate.toISOString();
  }

  write(all);
};

export const resetStage = (questionKey) => {
  const all = read();
  const m = all.find(x => x.id === questionKey);
  if (!m) return;

  m.stage = 0;
  m.nextReviewAt = new Date().toISOString();
  m.lastWrongAt = new Date().toISOString();

  write(all);
};

export const getMistakesDueCount = () => {
  return getDueCount(read());
};

export const getMistakeGroups = () => {
  const all = read();
  const now = new Date();

  return REVIEW_INTERVALS.map((interval, stage) => {
    const stageMistakes = all.filter(m => m.stage === stage);
    const dueNow = stageMistakes.filter(m => new Date(m.nextReviewAt) <= now);
    return {
      stage,
      label: interval.label,
      desc: interval.desc,
      days: interval.days,
      total: stageMistakes.length,
      dueNow: dueNow.length,
      mistakes: stageMistakes,
    };
  });
};

export const getDueMistakesForStage = (stage) => {
  const all = read();
  const now = new Date();
  return all.filter(m => m.stage === stage && new Date(m.nextReviewAt) <= now);
};

export const startReviewSession = (stage) => {
  const due = getDueMistakesForStage(stage);
  if (due.length === 0) return 0;

  const reviewQuestions = due.map(m => ({
    ...m.question,
    _mistakeId: m.id,
  }));

  localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(reviewQuestions));
  return reviewQuestions.length;
};

export const startAllReviewSession = () => {
  const all = read();
  const now = new Date();
  const due = all.filter(m => new Date(m.nextReviewAt) <= now);
  if (due.length === 0) return 0;

  const reviewQuestions = due.map(m => ({
    ...m.question,
    _mistakeId: m.id,
  }));

  localStorage.setItem(REVIEW_SESSION_KEY, JSON.stringify(reviewQuestions));
  return reviewQuestions.length;
};

export const getReviewSession = () => {
  try { return JSON.parse(localStorage.getItem(REVIEW_SESSION_KEY)) || []; }
  catch { return []; }
};

export const clearReviewSession = () => {
  localStorage.removeItem(REVIEW_SESSION_KEY);
};

export const getRecentMistakes = (count = 3) => {
  const all = read();
  const sorted = [...all].sort((a, b) => new Date(b.lastWrongAt).getTime() - new Date(a.lastWrongAt).getTime());
  return sorted.slice(0, count).map(m => ({
    id: m.id,
    question: m.question,
    stage: m.stage,
    lastWrongAt: m.lastWrongAt,
    source: m.source,
  }));
};

export const getPendingMistakesBySubject = () => {
  const all = read();
  const now = new Date();
  const pending = all.filter(m => new Date(m.nextReviewAt) <= now);
  const map = {};
  for (const m of pending) {
    const path = m.source?.file || '';
    const segments = path.replace(/\\/g, '/').split('/');
    const subjectSlug = segments.length >= 2 ? segments[1] : null;
    const label = subjectSlug
      ? subjectSlug.charAt(0).toUpperCase() + subjectSlug.slice(1).replace(/[-_]/g, ' ')
      : 'অন্যান্য';
    if (!map[label]) map[label] = [];
    map[label].push(m);
  }
  const entries = Object.entries(map).map(([subject, mistakes]) => ({
    subject,
    count: (mistakes as any[]).length,
    mistakes,
  }));
  entries.sort((a, b) => b.count - a.count);
  return entries;
};
