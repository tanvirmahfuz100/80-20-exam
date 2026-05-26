import type { RawQuestion } from '../types';

export interface ValidationResult {
  valid: boolean;
  warnings: string[];
}

const REQUIRED_FIELDS: (keyof RawQuestion)[] = ['id', 'question', 'text', 'question_text'];
const OPTION_FIELDS = ['options', 'answer', 'correct', 'correct_answer'];

export function validateQuestion(q: RawQuestion, source?: string): ValidationResult {
  const warnings: string[] = [];
  const tag = source ? `[${source}] ` : '';

  const hasId = REQUIRED_FIELDS.some((f) => q[f] !== undefined && q[f] !== null);
  if (!hasId) warnings.push(`${tag}Question missing identifier (id/question_id/_id)`);

  const hasText = REQUIRED_FIELDS.some((f) => q[f] !== undefined && q[f] !== null && q[f] !== '');
  if (!hasText) warnings.push(`${tag}Question missing text field`);

  const hasOptions = OPTION_FIELDS.some((f) => q[f as keyof RawQuestion] !== undefined);
  if (!hasOptions) warnings.push(`${tag}Question missing options/answer field`);

  if (q.options !== undefined) {
    const opts = q.options as Record<string, string> | string[];
    if (Array.isArray(opts) && opts.length < 2) {
      warnings.push(`${tag}Question has fewer than 2 options`);
    }
  }

  return { valid: warnings.length === 0, warnings };
}

export function validateQuestionBatch(questions: RawQuestion[], source?: string): ValidationResult[] {
  return questions.map((q) => validateQuestion(q, source));
}
