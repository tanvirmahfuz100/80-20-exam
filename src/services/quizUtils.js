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

export const normalizeQuizQuestions = (payload) => {
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
                    ? blank.options.map((option) => (typeof option === 'string' ? option : option?.text || ''))
                    : [];

                let correct = -1;
                if (blank.correct_answer) {
                    correct = options.findIndex(
                        (option) => String(option).trim().toLowerCase() === String(blank.correct_answer).trim().toLowerCase()
                    );
                }
                if (correct === -1) {
                    correct = (blank.options || []).findIndex((option) => option?.isCorrect);
                }
                if (correct === -1 && options.length > 0) {
                    correct = 0;
                }

                const correctOption = Array.isArray(blank.options)
                    ? blank.options.find((option) => option?.isCorrect)
                    : undefined;
                const explanation_bn = correctOption?.explanationBn || correctOption?.explanation_bn || blank.explanation_bn || '';
                const explanation_en = correctOption?.explanationEn || correctOption?.explanation_en || blank.explanation_en || '';

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
            return question.subQuestions.map((subQ) => ({
                id: subQ.id,
                text: `${subQ.instruction || 'Transform the sentence'}: "${subQ.sentence}"`,
                passage: subQ.sentence || '',
                options: (subQ.options || []).map((option) => option.text),
                correct: (subQ.options || []).findIndex((option) => option.isCorrect),
                explanation: (subQ.options || []).find((option) => option.isCorrect)?.explanationBn || '',
                difficulty: question.difficulty || 'medium'
            }));
        }

        let options = [];
        let correct = typeof question.correct === 'number' ? question.correct : 0;
        if (question.options && typeof question.options === 'object' && !Array.isArray(question.options)) {
            options = Object.values(question.options);
            if (question.answer) {
                correct = ['A', 'B', 'C', 'D'].indexOf(question.answer.toUpperCase());
            }
        } else {
            options = (question.options || []).map((option) => (
                typeof option === 'string' ? option : option.text || option.option_text || ''
            ));
        }

        if (question.correct_answer !== undefined && options.length > 0) {
            const found = options.findIndex(
                (opt) => String(opt).trim().toLowerCase() === String(question.correct_answer).trim().toLowerCase()
            );
            if (found !== -1) correct = found;
        }

        if (question.correct_tag !== undefined) {
            const found = options.findIndex(
                (opt) => String(opt).trim().toLowerCase() === String(question.correct_tag).trim().toLowerCase()
            );
            if (found !== -1) correct = found;
            else correct = 0;
        }

        return [{
            id: question.id || question.question_id || question._id || String(Math.random()),
            text: question.question || question.text || question.statement || question.stem || question.passage || 'Question',
            passage: question.passage || '',
            boxWords: question.boxWords || [],
            blankId: question.blankId || null,
            options,
            correct,
            explanation: (() => {
                const explanationBn = question.explanation_bn || question.explanationBn || '';
                const explanationEn = question.explanation_en || question.explanationEn || '';
                if (explanationBn && explanationEn) {
                    return `বাংলা ব্যাখ্যা:\n${explanationBn}\n\nEnglish Explanation:\n${explanationEn}`;
                }
                return explanationBn || explanationEn || question.explanation || '';
            })(),
            explanation_bn: question.explanation_bn || question.explanationBn || '',
            explanation_en: question.explanation_en || question.explanationEn || '',
            explanation_distractors: question.explanation_distractors || [],
            source: question.source || question.exam_appearance || '',
            difficulty: question.difficulty || 'medium'
        }];
    });
};
