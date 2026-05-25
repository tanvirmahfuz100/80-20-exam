import React from 'react';
import { motion } from 'framer-motion';
import { Book, Calculator, Brain, Briefcase, ChevronRight, Play, Timer, ShieldCheck, ArrowRight, BookOpen, Sparkles, Check } from 'lucide-react';

export const icons = {
    english: Book,
    math: Calculator,
    analytical: Brain,
    business_entrepreneurship: Briefcase,
    accounting: BookOpen,
};

export const examColors = {
    ssc: { accent: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'এসএসসি' },
    hsc: { accent: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', label: 'এইচএসসি' },
    iba: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', label: 'আইবিএ' },
    bcs: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'বিসিএস' },
    class7: { accent: '#f43f5e', bg: 'rgba(244,63,94,0.08)', label: 'সপ্তম শ্রেণী' },
};

export const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 }
};

export const stagger = {
    animate: { transition: { staggerChildren: 0.07 } }
};

export const cardSlide = {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 }
};

export const steps = [
    { key: 'exam', label: 'এক্সাম' },
    { key: 'subject', label: 'সাবজেক্ট' },
    { key: 'lessons', label: 'চ্যাপ্টার' },
];

export const ProgressBar = ({ completed, total, color }) => {
    if (total === 0) return null;
    const pct = Math.min(Math.round((completed / total) * 100), 100);
    const barColor = color || '#f54123';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ backgroundColor: barColor }}
                />
            </div>
            <span className="text-[11px] font-black tabular-nums whitespace-nowrap" style={{ color: barColor }}>{pct}%</span>
        </div>
    );
};

export const ExamCard = ({ exam, isSelected, onClick, progress }) => {
    const colors = examColors[exam.id] || examColors.ssc;
    const pct = progress.total > 0 ? Math.min(Math.round((progress.completed / progress.total) * 100), 100) : 0;
    const inProgress = progress.completed > 0;

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className="relative flex items-center gap-3 p-3.5 rounded-xl border transition-all text-left w-full group"
            style={{
                backgroundColor: isSelected ? colors.bg : 'rgba(255,255,255,0.03)',
                borderColor: isSelected ? colors.accent : 'rgba(255,255,255,0.06)',
            }}
        >
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full transition-all" style={{ backgroundColor: isSelected ? colors.accent : 'rgba(255,255,255,0.08)' }} />

            <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-tight leading-none">{exam.label}</h3>
                    {inProgress && (
                        <span className="text-[7px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded" style={{ color: colors.accent, backgroundColor: colors.bg }}>
                            অ্যাকটিভ
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-white/30 font-medium mt-0.5 leading-tight">{exam.note}</p>

                <div className="mt-2.5">
                    <ProgressBar completed={progress.completed} total={progress.total} color={colors.accent} />
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center transition-all"
                    style={{
                        backgroundColor: isSelected ? colors.accent : 'rgba(255,255,255,0.05)',
                        color: isSelected ? '#000' : 'rgba(255,255,255,0.25)',
                    }}
                >
                    <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-[7px] font-black uppercase tracking-widest transition-all" style={{ color: isSelected ? colors.accent : 'rgba(255,255,255,0.15)' }}>
                    {isSelected ? 'খোলো' : 'শুরু করো'}
                </span>
            </div>
        </motion.button>
    );
};

export const InactiveExam = ({ exam }) => {
    const colors = examColors[exam.id] || examColors.ssc;
    return (
        <div className="relative flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] opacity-40 cursor-not-allowed bg-white/[0.02]">
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-black text-white/50 tracking-tight leading-none">{exam.label}</h3>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-white/5 text-white/15">শীঘ্রই</span>
                </div>
                <p className="text-[11px] text-white/15 font-medium mt-0.5">{exam.note}</p>
            </div>
        </div>
    );
};

export const SubjectCard = ({ subject, isSelected, onClick, progress, version }) => {
    const Icon = icons[subject.id] || Book;
    const moduleCount = subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0) || 0;
    const pct = progress.total > 0 ? Math.min(Math.round((progress.completed / progress.total) * 100), 100) : 0;

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full text-left rounded-xl border transition-all group ${
                isSelected
                    ? 'bg-primary/12 border-primary ring-2 ring-primary/30'
                    : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/[0.03]'
            }`}>
            {isSelected && (
                <div className="absolute top-0 right-0 p-2 bg-primary/20 text-primary rounded-bl-xl z-10">
                    <ShieldCheck className="w-3 h-3" />
                </div>
            )}

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-primary text-white' : 'bg-surface-alt text-white/30 group-hover:text-white/50'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 break-words">
                    <h3 className={`font-black tracking-tight text-sm leading-tight ${
                        isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>{version === 'english' ? (subject.name_en || subject.name) : (subject.name_bn || subject.name)}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 mt-0.5">{moduleCount}টি মডিউল</p>
                </div>

                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1.5 w-full max-w-[5.5rem]">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="text-[10px] font-black tabular-nums text-primary/80 w-8 text-right shrink-0">{pct}%</span>
                    </div>
                </div>
            </div>
        </motion.button>
    );
};

const getChapterName = (chapter, topic, version) => {
    if (topic.chapters.length <= 1) {
        const localized = version === 'english'
            ? (topic.name_en || topic.name)
            : (topic.name_bn || topic.name);
        return localized;
    }
    return chapter.name.replace(/ Questions$/, '');
};

export const ChapterItem = ({ chapter, topic, onClick, questionCount, completedCount, index, version }) => {
    const hasQuestions = questionCount > 0;
    const cleanName = getChapterName(chapter, topic, version);
    const padIndex = String(index + 1).padStart(2, '0');
    const pct = questionCount > 0 ? Math.min(Math.round((completedCount / questionCount) * 100), 100) : 0;

    return (
        <motion.div
            className={`relative rounded-xl border transition-all ${
                hasQuestions
                    ? 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/[0.03]'
                    : 'bg-surface/50 border-white/[0.04] opacity-50'
            }`}
        >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-black text-sm ${
                    hasQuestions ? 'bg-primary/15 text-primary' : 'bg-white/[0.04] text-white/15'
                }`}>
                    {padIndex}
                </div>

                <div className="min-w-0">
                    <h4 className={`font-black tracking-tight text-sm leading-tight truncate ${
                        hasQuestions ? 'text-white' : 'text-white/40'
                    }`}>{cleanName}</h4>
                    {hasQuestions ? (
                        <p className="text-[10px] font-bold text-primary/60 mt-0.5">{questionCount}টি প্রশ্ন</p>
                    ) : (
                        <p className="text-[10px] font-bold text-white/15 mt-0.5">শীঘ্রই আসছে</p>
                    )}
                    {hasQuestions && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden max-w-[7rem]">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="text-[10px] font-black tabular-nums text-primary/60 w-7 text-right shrink-0">{pct}%</span>
                        </div>
                    )}
                </div>

                {hasQuestions && (
                    <button
                        onClick={() => onClick(chapter, cleanName)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all text-[9px] border-b-4 border-primary-dark active:border-b-0 active:translate-y-[2px] active:scale-95 shrink-0"
                    >
                        <Play className="w-3 h-3 fill-current" />
                        শুরু করো
                    </button>
                )}
            </div>
        </motion.div>
    );
};
