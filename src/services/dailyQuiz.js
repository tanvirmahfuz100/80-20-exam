const DAILY_CACHE_KEY = 'daily_quiz_cache_v2';
const QUESTIONS_PER_DAY = 5;

function dateSeed() {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
}

function seededShuffle(arr, seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash + seed.charCodeAt(i)) | 0;
  }
  const rng = () => {
    hash = (hash * 16807) % 2147483647;
    return (hash - 1) / 2147483646;
  };
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function isMCObject(q) {
  return q && q.question && q.options && typeof q.options === 'object' && !Array.isArray(q.options);
}

function isIBAQuestion(q) {
  return q && q.text && Array.isArray(q.options) && q.options.length > 0 && typeof q.correct === 'number' && q.correct >= 0;
}

function normalizeQuestion(q) {
  if (isMCObject(q)) {
    const optionKeys = Object.keys(q.options).filter(k => k.length === 1);
    return {
      id: q.id || q.question_id || Math.random().toString(36),
      question: q.question,
      options: optionKeys.map(k => ({ key: k, text: q.options[k] })),
      answer: q.answer ? q.answer.toUpperCase() : optionKeys[0] || 'A',
      explanation: q.explanation || q.explanation_bn || q.explanation_en || '',
      source: q.source || '',
    };
  }
  if (isIBAQuestion(q)) {
    return {
      id: q.id || Math.random().toString(36),
      question: q.text,
      options: q.options.map((text, i) => ({ key: String.fromCharCode(65 + i), text })),
      answer: String.fromCharCode(65 + q.correct),
      explanation: q.explanation || '',
      source: q.source || '',
    };
  }
  return null;
}

async function fetchQuestionsForFile(filePath) {
  try {
    const base = import.meta.env.BASE_URL || '/';
    const url = `${base}${filePath.replace(/^\//, '')}`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();

    let rawQuestions = data;
    if (data.questions && Array.isArray(data.questions)) {
      rawQuestions = data.questions;
    } else if (!Array.isArray(data)) {
      return [];
    }

    return rawQuestions.map(normalizeQuestion).filter(Boolean);
  } catch {
    return [];
  }
}

async function collectExamFilePaths(exam, group) {
  const base = import.meta.env.BASE_URL || '/';
  const examSlug = (exam || 'ssc').toLowerCase();
  const indexUrl = `${base}${examSlug}/index.json`;

  let indexData;
  try {
    const res = await fetch(indexUrl);
    if (!res.ok) return [];
    indexData = await res.json();
  } catch {
    return [];
  }

  const files = new Set();

  if (examSlug === 'bcs') {
    if (Array.isArray(indexData)) {
      indexData.forEach(item => {
        const id = item.id;
        const file = `/${examSlug}/${id}.json`;
        files.add(file);
      });
    }
    return [...files];
  }

  const subjects = indexData.subjects;
  if (!Array.isArray(subjects)) return [...files];

  subjects.forEach(subject => {
    const topics = subject.topics || [];
    topics.forEach(topic => {
      const chapters = topic.chapters || [];
      chapters.forEach(ch => {
        const file = ch.file || ch.file_bn || ch.file_en;
        if (file) files.add(file);
      });
    });
  });

  return [...files];
}

export async function getDailyQuizQuestions(exam, group) {
  const today = dateSeed();
  const cachedRaw = localStorage.getItem(DAILY_CACHE_KEY);

  if (cachedRaw) {
    try {
      const cached = JSON.parse(cachedRaw);
      if (cached.date === today && cached.exam === exam && cached.group === group) {
        return cached.questions;
      }
    } catch {}
  }

  const filePaths = await collectExamFilePaths(exam, group);
  const allQ = [];

  for (const fp of filePaths) {
    const qs = await fetchQuestionsForFile(fp);
    allQ.push(...qs);
  }

  const shuffled = seededShuffle(allQ, today + (exam || '') + (group || ''));
  const selected = shuffled.slice(0, QUESTIONS_PER_DAY);

  const cacheData = { date: today, exam, group, questions: selected };
  localStorage.setItem(DAILY_CACHE_KEY, JSON.stringify(cacheData));

  return selected;
}

export function clearDailyQuizCache() {
  localStorage.removeItem(DAILY_CACHE_KEY);
}
