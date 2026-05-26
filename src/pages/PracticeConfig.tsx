import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, ChevronRight, Check, Sparkles, Timer } from 'lucide-react';
import { Target, CheckList } from '../components/Illustrations';
import LottieAnimation from '../components/LottieAnimation';
import targetAnimation from '../assets/target.json';
import meditatingBrainAnimation from '../assets/meditating-brain.json';
import LoadingScreen from '../components/LoadingScreen';
import { usePracticeConfig } from '../hooks/usePracticeConfig';
import {
    fadeUp, stagger, cardSlide, steps,
    ExamCard, InactiveExam, SubjectCard, ChapterItem
} from '../components/PracticeConfigComponents';

const PracticeConfig = () => {
    const {
        data, selectedExam, selectedSubject, isTimed, loading, error,
        chapterQuestionCounts, chapterCompletedCounts,
        step, version,
        getChapterFile, getSubjectProgress, getExamProgress,
        setSelectedExam, setSelectedSubject, setIsTimed,
        goToStep, handleStart,
    } = usePracticeConfig();

    const versionLabel = version === 'english' ? 'ইংরেজি' : 'বাংলা';

    if (loading) return <LoadingScreen message="প্রস্তুত হচ্ছে..." />;

    if (error) return (
        <div className="p-6 md:p-10 bg-surface border rounded-2xl md:rounded-3xl flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-primary" />
            </div>
            <div>
                <h3 className="text-text font-black text-lg md:text-xl tracking-tighter bn-text">পথ বিরতি</h3>
                <p className="text-text-muted text-sm max-w-sm mx-auto mt-2 font-medium">{error}। আমরা লেসন লোড করতে পারিনি।</p>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-2xl bg-surface border p-5 md:p-6 flex flex-col md:flex-row md:items-end justify-between gap-3 shadow-sm"
            >
                <div className="min-w-0 flex-1 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                        className="text-xl md:text-3xl font-black text-text tracking-tight mb-1 bn-text"
                    >
                        চলো <span className="text-primary">প্রাক্টিস করি!</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                        className="text-text-muted font-medium text-xs"
                    >
                        তোমার প্রোগ্রেস লোকালি সেভ হচ্ছে টেস্টিংয়ের জন্য।
                    </motion.p>
                    {selectedExam && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18 }}
                            className="mt-1 text-[10px] font-bold uppercase tracking-[0.15em] text-primary/60 truncate bn-text"
                        >
                            এক্সাম: {selectedExam.label} &bull; ভার্সন: {versionLabel}
                        </motion.p>
                    )}
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-background border p-0.5 rounded-xl flex items-center gap-0.5 self-start md:self-end shrink-0 relative z-10"
                >
                    <button onClick={() => setIsTimed(false)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all whitespace-nowrap bn-text ${!isTimed ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}>
                        আনটাইমড
                    </button>
                    <button onClick={() => setIsTimed(true)} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold tracking-wider transition-all whitespace-nowrap bn-text ${isTimed ? 'bg-primary text-white shadow-sm' : 'text-text-muted hover:text-text'}`}>
                        <Timer className="w-3.5 h-3.5" />
                        টাইমড
                    </button>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="flex items-center gap-1 md:gap-2 text-[10px] font-bold uppercase tracking-[0.12em] py-2.5 md:py-3 px-3 md:px-4 bg-surface border rounded-xl overflow-x-auto no-scrollbar bn-text"
            >
                {steps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        {i > 0 && <ChevronRight className="w-3 h-3 text-text-muted" />}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 + i * 0.06 }}
                            onClick={() => goToStep(i)}
                            disabled={i > step}
                            className={`flex items-center gap-1.5 transition-all px-2.5 py-1.5 rounded-full text-[10px] font-bold ${i === step
                                ? 'text-white bg-primary'
                                : i < step
                                    ? 'text-primary bg-primary/10 cursor-pointer'
                                    : 'text-text-dim cursor-not-allowed'
                                }`}
                        >
                            {i < step && <Check className="w-3 h-3" />}
                            {s.label}
                        </motion.button>
                    </React.Fragment>
                ))}
                {selectedSubject && (
                    <span className="text-text-muted ml-auto hidden sm:inline text-[9px] truncate max-w-[120px] md:max-w-[200px] font-medium">
                        {selectedExam?.label} · {version === 'english' ? (selectedSubject.name_en || selectedSubject.name) : (selectedSubject.name_bn || selectedSubject.name)}
                    </span>
                )}
            </motion.div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="step-exam" variants={fadeUp} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-bold text-text flex items-center gap-2">
                                    <BookOpen className="text-primary w-4 h-4" />
                                    তোমার এক্সাম বেছে নাও
                                </h2>
                                <p className="text-[10px] text-text-muted font-medium mt-0.5">প্রাক্টিস শুরু করতে একটি এক্সাম বাছাই করো</p>
                            </div>
                            <span className="text-[10px] font-bold text-text-muted bg-background px-2.5 py-1 rounded-full">{data.exams.filter(e => e.active).length}টি অ্যাকটিভ</span>
                        </div>
                        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {(data.exams || []).map(exam =>
                                exam.active ? (
                                    <motion.div key={exam.id} variants={cardSlide}>
                                        <ExamCard
                                            exam={exam}
                                            isSelected={selectedExam?.id === exam.id}
                                            onClick={() => {
                                                setSelectedExam(exam);
                                                setSelectedSubject(null);
                                            }}
                                            progress={getExamProgress(exam)}
                                        />
                                    </motion.div>
                                ) : (
                                    <motion.div key={exam.id} variants={cardSlide}>
                                        <InactiveExam exam={exam} />
                                    </motion.div>
                                )
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 1 && selectedExam && (
                    <motion.div key="step-subject" variants={fadeUp} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="space-y-3">
                        <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="flex items-center justify-between">
                            <h2 className="text-sm font-bold text-text flex items-center gap-2">
                                <BookOpen className="text-primary w-4 h-4" />
                                {selectedExam.label} সাবজেক্ট
                            </h2>
                            <span className="text-[10px] font-bold text-text-muted">{selectedExam.subjects?.length || 0}টি সাবজেক্ট</span>
                        </motion.div>
                        <motion.div variants={stagger} initial="initial" animate="animate" className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                            {selectedExam.subjects.map(sub => (
                                <motion.div key={`${selectedExam.id}_${sub.id}`} variants={cardSlide}>
                                    <SubjectCard
                                        subject={sub}
                                        isSelected={selectedSubject?.id === sub.id}
                                        onClick={() => setSelectedSubject(sub)}
                                        progress={getSubjectProgress(sub)}
                                        version={version}
                                    />
                                </motion.div>
                            ))}
                        </motion.div>
                        {selectedExam.subjects.length === 0 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border bg-surface text-center flex flex-col items-center gap-4">
                                <div className="w-12 h-12 opacity-40">
                                    <LottieAnimation src={targetAnimation} className="w-full h-full" pingPong />
                                </div>
                                <p className="text-text-muted text-sm font-medium">এই এক্সামের জন্য এখনো কোনো প্রশ্ন উপলব্ধ নেই।</p>
                            </motion.div>
                        )}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                <button onClick={() => goToStep(0)} className="text-[10px] font-black uppercase tracking-[0.2em] text-text-dim hover:text-text-muted transition-colors mt-2 bn-text">
                                    ← এক্সামে ফিরে যাও
                                </button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence mode="wait">
                {step === 2 && selectedSubject && (
                    <motion.div key="step-chapters" variants={fadeUp} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">

                        <motion.div
                            initial={{ opacity: 0, x: -12 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.05 }}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] bn-text"
                        >
                            <span className="text-text-dim">{selectedExam.label}</span>
                            <span className="text-text-dim">/</span>
                            <span className="text-primary">{version === 'english' ? (selectedSubject.name_en || selectedSubject.name) : (selectedSubject.name_bn || selectedSubject.name)}</span>
                        </motion.div>

                        <motion.div variants={stagger} initial="initial" animate="animate" className="space-y-4">
                            {selectedSubject.topics.map((topic, ti) => {
                                const allEmpty = topic.chapters.every(ch => (chapterQuestionCounts[getChapterFile(ch)] ?? 0) === 0);
                                if (allEmpty && topic.chapters.length > 0) return null;

                                return (
                                    <motion.div key={topic.id} variants={cardSlide}>
                                        {topic.chapters.length > 1 && (
                                            <div className="flex items-center gap-2 pb-1.5">
                                                <div className="w-0.5 h-3 bg-primary/40 rounded-full shrink-0" />
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-text-dim bn-text">{version === 'english' ? (topic.name_en || topic.name) : (topic.name_bn || topic.name)}</span>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {topic.chapters.length > 0 ? (
                                                topic.chapters.map((chapter, ci) => (
                                                    <motion.div
                                                        key={chapter.id}
                                                        initial={{ opacity: 0, x: -12 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: 0.1 + (ti * 0.05) + (ci * 0.03) }}
                                                    >
                                                        <ChapterItem
                                                            chapter={chapter}
                                                            topic={topic}
                                                            index={ci}
                                                            onClick={handleStart}
                                                            version={version}
                                                            questionCount={chapterQuestionCounts[getChapterFile(chapter)] ?? 0}
                                                            completedCount={chapterCompletedCounts[getChapterFile(chapter)] ?? 0}
                                                        />
                                                    </motion.div>
                                                ))
                                            ) : (
                                                <motion.div
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ delay: 0.15 }}
                                                    className="col-span-2 py-8 text-center border-2 border-dashed border rounded-2xl flex flex-col items-center gap-3"
                                                >
                                                    <div className="w-12 h-12 opacity-40">
                                                        <LottieAnimation src={meditatingBrainAnimation} className="w-full h-full" pingPong />
                                                    </div>
                                                    <p className="text-xs text-text-dim font-black uppercase tracking-widest bn-text">চ্যাপ্টার শীঘ্রই আসছে!</p>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="flex items-center gap-3 pt-2"
                        >
                            <button onClick={() => goToStep(1)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-text-dim hover:text-text-muted transition-colors px-3 py-2 rounded-lg hover:bg-surface-alt bn-text">
                                ← সাবজেক্ট
                            </button>
                            <button onClick={() => goToStep(0)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-text-dim hover:text-text-muted transition-colors px-3 py-2 rounded-lg hover:bg-surface-alt bn-text">
                                ← এক্সাম
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PracticeConfig;
