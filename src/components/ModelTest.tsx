import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, PenTool, FileText, Shuffle, Music, X, Check, ArrowRight, ChevronRight } from 'lucide-react';
import GapFillPassage from './GapFillPassage';
import SubstitutionTableExercise from './SubstitutionTableExercise';
import Rearrangement from './Rearrangement';



const typeConfig = {
  passage_mcq: { icon: BookOpen, color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
  gap_fill_vocab: { icon: PenTool, color: 'text-emerald-400', bg: 'bg-emerald-400/10', border: 'border-emerald-400/20' },
  passage_summary: { icon: FileText, color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
  sentence_matching: { icon: Shuffle, color: 'text-orange-400', bg: 'bg-orange-400/10', border: 'border-orange-400/20' },
  rearrangement: { icon: Shuffle, color: 'text-pink-400', bg: 'bg-pink-400/10', border: 'border-pink-400/20' },
  poetry_mcq: { icon: Music, color: 'text-rose-400', bg: 'bg-rose-400/10', border: 'border-rose-400/20' },
};

const VocabPopup = ({ vocab, onClose }) => {
  if (!vocab) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80" />
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.92 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-sm bg-surface border rounded-2xl p-5 space-y-3"
        onClick={e => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute top-3 right-3 p-1 rounded-full text-text-dim hover:text-text hover:bg-surface-hover transition-colors">
          <X size={16} />
        </button>
        <div className="pr-6">
          <p className="text-lg font-black text-text mb-1" style={{ fontSize: '18px' }}>{vocab.word}</p>
          {vocab.pos && <span className="text-[9px] font-black text-text-dim uppercase tracking-widest">({vocab.pos})</span>}
        </div>
        {vocab.meaning_bn && (
          <div>
            <p className="text-[9px] font-black text-text-dim uppercase tracking-wider mb-0.5 bn-text">বাংলা অর্থ</p>
            <p className="text-text font-medium leading-relaxed" style={{ fontSize: '14px' }}>{vocab.meaning_bn}</p>
          </div>
        )}
        {vocab.meaning_en && (
          <div>
            <p className="text-[9px] font-black text-text-dim uppercase tracking-wider mb-0.5">English Meaning</p>
            <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: '13px' }}>{vocab.meaning_en}</p>
          </div>
        )}
        <div className="grid grid-cols-2 gap-2 pt-1">
          {vocab.synonym && (
            <div className="bg-emerald-500/10 rounded-xl p-2.5 border border-emerald-500/15">
              <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest mb-0.5">Synonym</p>
              <p className="text-emerald-300 font-bold" style={{ fontSize: '13px' }}>{vocab.synonym}</p>
            </div>
          )}
          {vocab.antonym && (
            <div className="bg-red-500/10 rounded-xl p-2.5 border border-red-500/15">
              <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-0.5">Antonym</p>
              <p className="text-red-300 font-bold" style={{ fontSize: '13px' }}>{vocab.antonym}</p>
            </div>
          )}
        </div>
        <button onClick={onClose} className="w-full mt-1 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97]">
          Got it!
        </button>
      </motion.div>
    </div>
  );
};

const VocabChip = ({ vocab, onClick }) => (
  <button
    onClick={() => onClick(vocab)}
    className="px-3 py-1.5 rounded-lg bg-primary/10 border border-primary/25 text-primary font-bold text-[11px] hover:bg-primary/20 transition-all active:scale-[0.97]"
  >
    {vocab.word}
  </button>
);

const ModelTest = ({ chapters, fontSize, onCorrectAttempt, onWrongAttempt, onContinue }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [completedSet, setCompletedSet] = useState(new Set());
  const [phase, setPhase] = useState(() => getInitialPhase(chapters[0]?.type));
  const [activeVocab, setActiveVocab] = useState(null);

  const [mcqIndex, setMcqIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showPassage, setShowPassage] = useState(false);

  const scoreRef = useRef(0);
  const questionsRef = useRef(0);
  const scoredIdsRef = useRef(new Set());
  const [, tick] = useState(0);
  const rerender = useCallback(() => tick(s => s + 1), []);

  function getInitialPhase(type) {
    if (type === 'passage_mcq' || type === 'passage_summary') return 'passage';
    if (type === 'gap_fill_vocab') return 'gapFill';
    if (type === 'poetry_mcq') return 'questions';
    return null;
  }

  const chapter = chapters[currentIdx];
  const isLast = currentIdx === chapters.length - 1;
  const config = typeConfig[chapter?.type] || { icon: BookOpen, color: 'text-text', bg: 'bg-surface-alt', border: 'border' };
  const Icon = config.icon;

  const resetChapter = useCallback(() => {
    setPhase(getInitialPhase(chapter?.type));
    setMcqIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setActiveVocab(null);
    setShowPassage(false);
  }, [chapter?.type]);

  const advanceToNextChapter = useCallback(() => {
    if (!isLast) {
      const nextIdx = currentIdx + 1;
      const nextChapter = chapters[nextIdx];
      setCurrentIdx(nextIdx);
      setPhase(getInitialPhase(nextChapter?.type));
      setMcqIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setActiveVocab(null);
      setShowPassage(false);
    }
  }, [isLast, currentIdx, chapters]);

  const completeChapter = useCallback((chapterQCount) => {
    const newSet = new Set(completedSet);
    newSet.add(currentIdx);
    setCompletedSet(newSet);
    questionsRef.current += chapterQCount;

    if (isLast) {
      onContinue?.(scoreRef.current, questionsRef.current);
    } else {
      const nextIdx = currentIdx + 1;
      const nextChapter = chapters[nextIdx];
      setCurrentIdx(nextIdx);
      setPhase(getInitialPhase(nextChapter?.type));
      setMcqIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
      setActiveVocab(null);
      setShowPassage(false);
    }
  }, [currentIdx, isLast, chapters, completedSet, onContinue]);

  const passageContent = chapter?.type === 'passage_mcq' ? chapter.content : null;
  const summaryContent = chapter?.type === 'passage_summary' ? chapter.content : null;
  const gapFillContent = chapter?.type === 'gap_fill_vocab' ? chapter.content : null;

  const currentPassage = passageContent?.passage || summaryContent?.passage || '';
  const currentTranslation = passageContent?.translation_bn || summaryContent?.translation_bn || '';
  const currentVocab = passageContent?.vocabulary || summaryContent?.vocabulary || [];
  const currentQuestions = passageContent?.questions || summaryContent?.mcqQuestions || [];
  const trueFalseQuestions = summaryContent?.trueFalseQuestions || [];
  const allQuestions = useMemo(() => {
    if (chapter?.type === 'passage_mcq') return chapter.content?.questions || [];
    if (chapter?.type === 'passage_summary') return [...(chapter.content?.mcqQuestions || []), ...(chapter.content?.trueFalseQuestions || [])];
    if (chapter?.type === 'poetry_mcq') return chapter.content?.questions || [];
    if (chapter?.type === 'gap_fill_vocab') return chapter.content?.vocabQuestions || [];
    return [];
  }, [chapter]);

  const handleMCQSelect = useCallback((optIdx) => {
    if (isAnswered) return;
    setIsAnswered(true);
    setSelectedOption(optIdx);
    const q = allQuestions[mcqIndex];
    if (!scoredIdsRef.current.has(q.id)) {
      scoredIdsRef.current.add(q.id);
      if (optIdx === q.correct) {
        scoreRef.current += 1;
        rerender();
        onCorrectAttempt?.();
      } else {
        onWrongAttempt?.();
      }
    }
  }, [isAnswered, allQuestions, mcqIndex, onWrongAttempt, onCorrectAttempt, rerender]);

  const handleMCQNext = useCallback(() => {
    if (mcqIndex < allQuestions.length - 1) {
      setMcqIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else if (chapter?.type === 'passage_summary' && phase === 'questions') {
      setPhase('summary');
      setMcqIndex(0);
      setSelectedOption(null);
      setIsAnswered(false);
    } else if (phase === 'vocabQuestions') {
      const gapBlankTotal = gapFillContent?.gapFill?.blanks?.length || 0;
      const vocabTotal = gapFillContent?.vocabQuestions?.length || 0;
      completeChapter(gapBlankTotal + vocabTotal);
    } else {
      completeChapter(allQuestions.length);
    }
  }, [mcqIndex, allQuestions.length, phase, chapter?.type, gapFillContent, completeChapter]);

  const handlePassageNext = useCallback(() => {
    if (chapter?.type === 'passage_summary') {
      setPhase('questions');
    } else if (chapter?.type === 'passage_mcq') {
      setPhase('questions');
    }
    setMcqIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    scoredIdsRef.current = new Set();
  }, [chapter?.type]);

  const handleSummaryContinue = useCallback(() => {
    completeChapter(allQuestions.length);
  }, [allQuestions.length, completeChapter]);

  const handleBlankAnswer = useCallback((blankId, isCorrect) => {
    const key = `${currentIdx}_${blankId}`;
    if (!scoredIdsRef.current.has(key)) {
      scoredIdsRef.current.add(key);
      if (isCorrect) {
        scoreRef.current += 1;
        rerender();
        onCorrectAttempt?.();
      } else {
        onWrongAttempt?.();
      }
    }
  }, [currentIdx, onWrongAttempt, onCorrectAttempt, rerender]);

  const handleGapFillContinue = useCallback(() => {
    setPhase('vocabQuestions');
    setMcqIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
  }, []);

  const handleSubTableContinue = useCallback((found, total) => {
    scoreRef.current += found;
    questionsRef.current += total;
    completeChapter(total);
  }, [completeChapter]);

  const handleRearrangementContinue = useCallback((result) => {
    scoreRef.current += result;
    questionsRef.current += 1;
    completeChapter(1);
  }, [completeChapter]);

  const OptionButton = ({ option, idx, correctIdx }) => {
    let state = 'idle';
    if (isAnswered) {
      if (idx === correctIdx) state = 'correct';
      else if (idx === selectedOption) state = 'wrong';
      else state = 'dimmed';
    } else if (idx === selectedOption) {
      state = 'selected';
    }

    return (
      <button
        onClick={() => {
          if (!isAnswered) handleMCQSelect(idx);
        }}
        className={`w-full text-left px-4 py-3.5 rounded-xl border font-bold leading-snug transition-all active:scale-[0.98] ${
          state === 'correct'
            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/30'
            : state === 'wrong'
              ? 'bg-yellow-500/15 border-yellow-500/40 text-yellow-300 ring-1 ring-yellow-500/30'
              : state === 'selected'
                ? 'bg-primary/20 border-primary/50 text-white ring-1 ring-primary/40'
                : state === 'dimmed'
                  ? 'bg-surface-alt border text-text-dim'
                  : 'bg-surface-alt border text-text-muted hover:bg-surface-hover hover:border-text-muted'
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        {state === 'correct' && <Check className="w-4 h-4 inline mr-2 -mt-0.5 text-emerald-400 shrink-0" />}
        {state === 'wrong' && <X className="w-4 h-4 inline mr-2 -mt-0.5 text-yellow-400 shrink-0" />}
        {option.text || option}
      </button>
    );
  };

  const q = allQuestions[mcqIndex];
  const currentOptions = q?.options || [];
  const correctIdx = q?.correct;

  const renderMCQs = useCallback(() => {
    if (!q) return null;
    return (
      <div className="flex-1 flex flex-col min-h-0 gap-2">
        <div className="flex-1 overflow-y-auto min-h-0 space-y-2.5 px-0.5">
          <motion.div
            key={mcqIndex}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black text-text-dim uppercase tracking-wider">
                Question {mcqIndex + 1} of {allQuestions.length}
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[9px] font-black text-emerald-400/60 uppercase tracking-wider">
                  Done
                </span>
                <span className="text-[10px] font-black tabular-nums text-emerald-400">
                  {mcqIndex + (isAnswered ? 1 : 0)}
                </span>
                <span className="text-[9px] text-text-dim">/</span>
                <span className="text-[10px] font-black tabular-nums text-text-dim">
                  {allQuestions.length}
                </span>
              </div>
            </div>
            <div className="bg-surface-alt border rounded-xl p-3">
              <p className="font-black text-text leading-snug" style={{ fontSize: `${fontSize}px` }}>
                {q.question}
              </p>
            </div>
            <div className="space-y-2">
              {currentOptions.map((option, idx) => (
                <OptionButton key={idx} option={option} idx={idx} correctIdx={correctIdx} />
              ))}
            </div>
          </motion.div>

          <AnimatePresence>
            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="p-4 rounded-xl bg-surface-alt border space-y-2"
              >
                {selectedOption !== undefined && selectedOption !== null && selectedOption === q.correct && (
                  <div className="flex items-center gap-2 mb-1">
                    <div className="p-1 rounded-lg bg-emerald-500/15">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Correct!</span>
                  </div>
                )}
                {q.explanation_bn && (
                  <div>
                    <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-0.5 bn-text">বাংলা ব্যাখ্যা</p>
                    <p className="text-text font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>{q.explanation_bn}</p>
                  </div>
                )}
                {q.explanation_en && (
                  <div>
                    <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-0.5">English Explanation</p>
                    <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>{q.explanation_en}</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {isAnswered && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="shrink-0 sticky bottom-0"
          >
            <button
              onClick={handleMCQNext}
              className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
            >
              {mcqIndex < allQuestions.length - 1 ? (
                <>Next <ChevronRight className="w-3 h-3" /></>
              ) : (
                <>Continue <ArrowRight className="w-3 h-3" /></>
              )}
            </button>
          </motion.div>
        )}
      </div>
    );
  }, [q, mcqIndex, allQuestions.length, currentOptions, correctIdx, isAnswered, selectedOption, fontSize, handleMCQNext, handleMCQSelect]);

  if (!chapter) return null;

  const chapterProgress = currentIdx + 1;
  const chapterTotal = chapters.length;

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-2">
      <div className="shrink-0 space-y-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-xl ${config.bg} ${config.border}`}>
            <Icon className={`w-4 h-4 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[9px] font-black text-text-dim uppercase tracking-widest">
              Chapter {chapterProgress} of {chapterTotal}
            </p>
            <p className="text-sm font-black text-text truncate" style={{ fontSize: `${fontSize + 2}px` }}>
              {chapter.name}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          {chapters.map((ch, idx) => {
            const isCurrent = idx === currentIdx;
            const isDone = completedSet.has(idx);
            return (
              <div
                key={ch.id}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  isDone
                    ? 'bg-emerald-500'
                    : isCurrent
                      ? 'bg-primary'
                      : 'bg-surface-alt'
                }`}
              />
            );
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {chapter.type === 'passage_mcq' && phase === 'passage' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2.5">
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 px-0.5">
              <p className="text-text font-medium leading-relaxed whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                {currentPassage}
              </p>
              {currentTranslation && (
                <div className="p-3 rounded-xl bg-surface-alt border">
                  <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-1 bn-text">বাংলা অনুবাদ</p>
                  <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>
                    {currentTranslation}
                  </p>
                </div>
              )}
              {currentTranslation && (
                <div className="p-3 rounded-xl bg-surface-alt border">
                  <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-1 bn-text">বাংলা অনুবাদ</p>
                  <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>
                    {currentTranslation}
                  </p>
                </div>
              )}
            </div>
            <div className="shrink-0 sticky bottom-0">
              <button
                onClick={handlePassageNext}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
              >
                Start Questions <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {chapter.type === 'passage_summary' && phase === 'passage' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2.5">
            <div className="flex-1 overflow-y-auto min-h-0 space-y-3 px-0.5">
              <p className="text-text font-medium leading-relaxed whitespace-pre-wrap" style={{ fontSize: `${fontSize}px` }}>
                {currentPassage}
              </p>
              {currentTranslation && (
                <div className="p-3 rounded-xl bg-surface-alt border">
                  <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-1 bn-text">বাংলা অনুবাদ</p>
                  <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>
                    {currentTranslation}
                  </p>
                </div>
              )}
              {currentTranslation && (
                <div className="p-3 rounded-xl bg-surface-alt border">
                  <p className="text-[8px] font-black text-text-dim uppercase tracking-wider mb-1 bn-text">বাংলা অনুবাদ</p>
                  <p className="text-text-muted font-medium leading-relaxed" style={{ fontSize: `${Math.max(12, fontSize - 1)}px` }}>
                    {currentTranslation}
                  </p>
                </div>
              )}
            </div>
            <div className="shrink-0 sticky bottom-0">
              <button
                onClick={handlePassageNext}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
              >
                Start Questions <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {chapter.type === 'passage_mcq' && phase === 'questions' && (
          <div className="flex-1 flex flex-col min-h-0">
            <button
              onClick={() => setShowPassage(v => !v)}
              className="shrink-0 self-start mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover border text-text-muted hover:text-text transition-all text-[10px] font-bold uppercase tracking-wider"
            >
              <BookOpen className="w-3 h-3" />
              {showPassage ? 'Hide Passage' : 'See Passage'}
            </button>
            <AnimatePresence>
              {showPassage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden shrink-0"
                >
                  <div className="mb-3 p-3 rounded-xl bg-surface-alt border max-h-48 overflow-y-auto">
                    <p className="text-text-muted font-medium leading-relaxed whitespace-pre-wrap text-[13px]">
                      {currentPassage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {renderMCQs()}
          </div>
        )}

        {chapter.type === 'passage_summary' && phase === 'questions' && (
          <div className="flex-1 flex flex-col min-h-0">
            <button
              onClick={() => setShowPassage(v => !v)}
              className="shrink-0 self-start mb-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-alt hover:bg-surface-hover border text-text-muted hover:text-text transition-all text-[10px] font-bold uppercase tracking-wider"
            >
              <BookOpen className="w-3 h-3" />
              {showPassage ? 'Hide Passage' : 'See Passage'}
            </button>
            <AnimatePresence>
              {showPassage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden shrink-0"
                >
                  <div className="mb-3 p-3 rounded-xl bg-surface-alt border max-h-48 overflow-y-auto">
                    <p className="text-text-muted font-medium leading-relaxed whitespace-pre-wrap text-[13px]">
                      {currentPassage}
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            {renderMCQs()}
          </div>
        )}

        {chapter.type === 'passage_summary' && phase === 'summary' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2.5">
            <div className="flex-1 overflow-y-auto min-h-0 px-0.5">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-[8px] font-black text-primary uppercase tracking-widest mb-2">Summary</p>
                <p className="text-text font-medium leading-relaxed" style={{ fontSize: `${fontSize}px` }}>
                  {summaryContent?.summary}
                </p>
              </div>
            </div>
            <div className="shrink-0 sticky bottom-0">
              <button
                onClick={handleSummaryContinue}
                className="w-full py-3.5 bg-primary hover:bg-primary-hover text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all active:scale-[0.97] flex items-center justify-center gap-1.5 border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px]"
              >
                {isLast ? 'Finish Test' : 'Next Chapter'} <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {chapter.type === 'gap_fill_vocab' && phase === 'gapFill' && (
          <GapFillPassage
            passage={gapFillContent.gapFill.passage}
            blanks={gapFillContent.gapFill.blanks}
            boxWords={gapFillContent.gapFill.boxWords}
            difficulty="medium"
            fontSize={fontSize}
            onBlankAnswer={handleBlankAnswer}
            onContinue={handleGapFillContinue}
          />
        )}

        {chapter.type === 'gap_fill_vocab' && phase === 'vocabQuestions' && (
          <div className="flex-1 flex flex-col min-h-0 gap-2">
            <p className="text-[9px] font-black text-emerald-400 uppercase tracking-wider shrink-0 px-0.5">Vocabulary Questions</p>
            {renderMCQs()}
          </div>
        )}

        {chapter.type === 'sentence_matching' && (
          <SubstitutionTableExercise
            exercise={chapter.content.exercise}
            fontSize={fontSize}
            onWrongAttempt={onWrongAttempt}
            onContinue={handleSubTableContinue}
          />
        )}

        {chapter.type === 'rearrangement' && (
          <Rearrangement
            sentences={chapter.content.sentences}
            correctOrder={chapter.content.correctOrder}
            reconstructedParagraph={chapter.content.reconstructedParagraph}
            fontSize={fontSize}
            onWrongAttempt={onWrongAttempt}
            onContinue={handleRearrangementContinue}
          />
        )}

        {chapter.type === 'poetry_mcq' && phase === 'questions' && renderMCQs()}
      </div>

      {activeVocab && <VocabPopup vocab={activeVocab} onClose={() => setActiveVocab(null)} />}
    </div>
  );
};

export default ModelTest;
