export const stripMath = (text) => {
  if (!text) return '';
  return text
    .replace(/\$/g, '')
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, '$1/$2')
    .replace(/\\sqrt\{([^}]*)\}/g, '√$1')
    .replace(/\\cdot/g, '·')
    .replace(/\\times/g, '×')
    .replace(/\\Rightarrow/g, '→')
    .replace(/\\approx/g, '≈')
    .replace(/\\neq/g, '≠')
    .replace(/\\ge/g, '≥')
    .replace(/\\le/g, '≤')
    .replace(/\\implies/g, '⇒')
    .replace(/\\therefore/g, '∴');
};

import { normalizeQuizQuestion, pickQuestionText, resolveOptions, pickExplanation } from '../utils/normalizeQuestion';
import type { RawQuestion } from '../types';

export const normalizeQuizQuestions = (payload: RawQuestion | RawQuestion[]) => {
    const sourceQuestions = Array.isArray(payload)
        ? payload
        : Array.isArray(payload?.questions)
            ? payload.questions
            : [];

    return sourceQuestions.flatMap((question) => {
        if (question._type === 'substitution_table' || question._type === 'model_test' || question._type === 'creative_question') {
            return [question];
        }
        if (Array.isArray(question.blanks) && question.blanks.length > 0) {
            const qId = question.id || question.question_id || 'q';
            return question.blanks.map((blank, blankIndex) => {
                const blankId = blank.blankId || blank.blank_id || blank.id || String(blankIndex + 1);
                const options = Array.isArray(blank.options)
                    ? blank.options.map((option: unknown) => (typeof option === 'string' ? option : (option as { text?: string }).text || ''))
                    : [];

                let correct = -1;
                if (blank.correct_answer) {
                    correct = options.findIndex(
                        (option: string) => String(option).trim().toLowerCase() === String(blank.correct_answer).trim().toLowerCase()
                    );
                }
                if (correct === -1) {
                    correct = (blank.options || []).findIndex((option: unknown) => (option as { isCorrect?: boolean }).isCorrect);
                }
                if (correct === -1 && options.length > 0) {
                    correct = 0;
                }

                const correctOption = Array.isArray(blank.options)
                    ? blank.options.find((option: unknown) => (option as { isCorrect?: boolean }).isCorrect)
                    : undefined;
                const explanation_bn = (correctOption as Record<string, string>)?.explanationBn || (correctOption as Record<string, string>)?.explanation_bn || blank.explanation_bn || '';
                const explanation_en = (correctOption as Record<string, string>)?.explanationEn || (correctOption as Record<string, string>)?.explanation_en || blank.explanation_en || '';

                return {
                    id: `${qId}_${blankId}`,
                    text: `Choose the correct word for blank (${blankId})`,
                    passage: question.passage || question.passage_text || '',
                    boxWords: question.boxWords || [],
                    blankId,
                    options,
                    correct,
                    explanation: explanation_bn,
                    explanation_bn,
                    explanation_en,
                    difficulty: question.difficulty || 'medium'
                };
            });
        }

        if (Array.isArray(question.subQuestions) && question.subQuestions.length > 0) {
            return question.subQuestions.map((subQ: RawQuestion) => ({
                id: subQ.id,
                text: `${subQ.instruction || 'Transform the sentence'}: "${subQ.sentence}"`,
                passage: subQ.sentence || '',
                options: ((subQ.options || []) as unknown[]).map((option: unknown) => (option as { text?: string }).text),
                correct: ((subQ.options || []) as unknown[]).findIndex((option: unknown) => (option as { isCorrect?: boolean }).isCorrect),
                explanation: ((subQ.options || []) as unknown[]).find((option: unknown) => (option as { isCorrect?: boolean }).isCorrect)?.explanationBn || '',
                difficulty: question.difficulty || 'medium'
            }));
        }

        const base = normalizeQuizQuestion(question);
        return [{
            ...base,
            passage: question.passage || '',
            boxWords: question.boxWords || [],
            blankId: question.blankId || null,
            explanation_distractors: question.explanation_distractors || [],
            source: question.source || (question as Record<string, string>)['exam_appearance'] || '',
        }];
    });
};
