import type { RawQuestion } from '../types';

export interface NormalizedBase {
  id: string | number;
  text: string;
  options: string[];
  correct: number;
  explanation: string;
  explanation_bn: string;
  explanation_en: string;
  difficulty: string;
  source?: string;
  year?: string;
  passage?: string;
  boxWords?: string[];
  blankId?: string | null;
  uuid?: string;
  _type?: string;
}

/** Resolve question text from various possible field names */
export function pickQuestionText(q: RawQuestion): string {
  return q.question || q.text || q.statement || q.stem || q.passage_text || q.title || q.passage || 'Question';
}

/** Resolve options array and correct answer index */
export function resolveOptions(q: RawQuestion): { options: string[]; correct: number } {
  let options: string[] = [];
  let correct = 0;

  // Object-format options { A: "...", B: "...", ... }
  if (q.options && typeof q.options === 'object' && !Array.isArray(q.options)) {
    options = Object.values(q.options as Record<string, string>);
    if (q.answer) {
      correct = ['A', 'B', 'C', 'D'].indexOf(q.answer.toUpperCase());
      if (correct === -1) correct = 0;
    }
    return { options, correct };
  }

  // Array-format options (strings or option objects)
  const rawOptions = Array.isArray(q.options) ? q.options : [];
  options = rawOptions.map((opt) =>
    typeof opt === 'string' ? opt : (opt as { text?: string; option_text?: string }).text || (opt as { text?: string; option_text?: string }).option_text || ''
  );

  // Find correct answer by index
  if (typeof q.correct === 'number' && q.correct >= 0 && q.correct < options.length) {
    correct = q.correct;
  }

  // Find correct answer by matching text
  if (q.correct_answer !== undefined) {
    const found = options.findIndex(
      (opt) => String(opt).trim().toLowerCase() === String(q.correct_answer).trim().toLowerCase()
    );
    if (found !== -1) correct = found;
  }

  // Find correct by tag
  if (q.correct_tag !== undefined) {
    const found = options.findIndex(
      (opt) => String(opt).trim().toLowerCase() === String(q.correct_tag).trim().toLowerCase()
    );
    if (found !== -1) correct = found;
  }

  // Fallback to isCorrect flag on option objects
  if (correct === 0 && options.length > 0) {
    const flaggedIdx = rawOptions.findIndex((opt) => (opt as { isCorrect?: boolean }).isCorrect);
    if (flaggedIdx !== -1) correct = flaggedIdx;
  }

  return { options, correct };
}

/** Resolve explanation from various possible field names */
export function pickExplanation(q: RawQuestion): string {
  const bn = q.explanation_bn || (q as Record<string, string>)['explanationBn'] || '';
  const en = q.explanation_en || (q as Record<string, string>)['explanationEn'] || '';
  if (bn && en) return `বাংলা ব্যাখ্যা:\n${bn}\n\nEnglish Explanation:\n${en}`;
  return bn || en || q.explanation || '';
}

/** Full normalization for quiz use (simple format) */
export function normalizeQuizQuestion(q: RawQuestion): NormalizedBase {
  const { options, correct } = resolveOptions(q);
  return {
    id: q.id || q.question_id || q._id || String(Math.random()),
    text: pickQuestionText(q),
    options,
    correct,
    explanation: pickExplanation(q),
    explanation_bn: q.explanation_bn || (q as Record<string, string>)['explanationBn'] || '',
    explanation_en: q.explanation_en || (q as Record<string, string>)['explanationEn'] || '',
    difficulty: q.difficulty || 'medium',
    source: q.source || (q as Record<string, string>)['exam_appearance'] || '',
    year: q.year || '',
    passage: q.passage || '',
    boxWords: q.boxWords || [],
    blankId: q.blankId || null,
    uuid: q.uuid || '',
    _type: q._type || '',
  };
}
