import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Play, Check } from 'lucide-react';

const svgSlugMap: Record<string, string> = {
    bangla: 'subject-language',
    bangla_1st: 'subject-language',
    bangla_2nd: 'subject-language',
    english: 'subject-language',
    ict: 'subject-science',
    math: 'subject-math',
    analytical: 'subject-math',
    business_entrepreneurship: 'subject-business',
    finance: 'subject-business',
    general_science: 'subject-science',
    agriculture: 'subject-agriculture',
    islam: 'subject-islam',
    accounting: 'subject-business',
    management_1st: 'subject-business',
    management_2nd: 'subject-business',
    marketing_1st: 'subject-business',
    marketing_2nd: 'subject-business',
};

function getSvgUrl(svgName: string) {
    return `${import.meta.env.BASE_URL || '/'}assets/images/icons/${svgName}.svg`;
}

export const examColors = {
    ssc: { accent: '#666666', bg: 'rgba(100,100,100,0.08)', label: 'এসএসসি' },
    hsc: { accent: '#666666', bg: 'rgba(100,100,100,0.08)', label: 'এইচএসসি' },
    iba: { accent: '#666666', bg: 'rgba(100,100,100,0.08)', label: 'আইবিএ' },
    bcs: { accent: '#666666', bg: 'rgba(100,100,100,0.08)', label: 'বিসিএস' },
    class7: { accent: '#666666', bg: 'rgba(100,100,100,0.08)', label: 'সপ্তম শ্রেণী' },
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
    const barColor = color || '#666666';
    return (
        <div className="flex items-center gap-2 w-full">
            <div className="flex-1 h-1.5 bg-eel rounded-full overflow-hidden">
                <motion.div
                    className="h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    style={{ backgroundColor: barColor }}
                />
            </div>
            <span className="text-[10px] font-bold tabular-nums whitespace-nowrap text-hare">{pct}%</span>
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
            className="relative flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left w-full group"
            style={{
                backgroundColor: isSelected ? colors.bg : 'var(--color-surface)',
                borderColor: isSelected ? colors.accent : 'rgb(var(--color-wolf))',
            }}
        >
            <div className={`w-1 rounded-full transition-all shrink-0`} style={{ backgroundColor: isSelected ? colors.accent : 'transparent', height: '40px' }} />

            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl md:text-2xl font-bold text-text tracking-tight leading-none">{exam.label}</h3>
                    {inProgress && (
                        <span className="text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bn-text" style={{ color: colors.accent, backgroundColor: colors.bg }}>
                            অ্যাকটিভ
                        </span>
                    )}
                </div>
                <p className="text-[11px] text-hare font-medium mt-0.5 leading-tight">{exam.note}</p>

                <div className="mt-2.5">
                    <ProgressBar completed={progress.completed} total={progress.total} color={colors.accent} />
                </div>
            </div>

            <div className="flex flex-col items-center gap-1 shrink-0">
                <div
                    className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                    style={{
                        backgroundColor: isSelected ? colors.accent : '#e5e5e5',
                        color: isSelected ? '#fff' : '#999',
                    }}
                >
                    <ArrowRight className="w-4 h-4" />
                </div>
                <span className="text-[7px] font-bold uppercase tracking-widest transition-all bn-text" style={{ color: isSelected ? colors.accent : '#999' }}>
                    {isSelected ? 'খোলো' : 'শুরু করো'}
                </span>
            </div>
        </motion.button>
    );
};

export const InactiveExam = ({ exam }) => {
    const colors = examColors[exam.id] || examColors.ssc;
    return (
        <div className="relative flex items-center gap-3 p-3.5 rounded-2xl border-2 border opacity-40 cursor-not-allowed bg-surface">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-bold text-hare tracking-tight leading-none">{exam.label}</h3>
                        <span className="text-[7px] font-bold uppercase tracking-[0.2em] px-1.5 py-0.5 rounded-full bg-eel text-hare bn-text">শীঘ্রই</span>
                </div>
                <p className="text-[11px] text-hare/50 font-medium mt-0.5">{exam.note}</p>
            </div>
        </div>
    );
};

export const SubjectCard = ({ subject, isSelected, onClick, progress, version }) => {
    const svgName = svgSlugMap[subject.id] || 'general';
    const moduleCount = subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0) || 0;
    const pct = progress.total > 0 ? Math.min(Math.round((progress.completed / progress.total) * 100), 100) : 0;

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={`relative overflow-hidden w-full text-left rounded-2xl border-2 transition-all ${
                isSelected
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border hover:border-primary/40'
            }`}>
            <img
                src={getSvgUrl(svgName)}
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/60" />

            {isSelected && (
                <div className="absolute top-2 right-2 p-1.5 bg-primary text-white rounded-full z-10">
                    <Check className="w-3 h-3" />
                </div>
            )}

            <div className="relative z-10 grid grid-cols-[1fr_auto] items-center gap-3 p-4">
                <div className="min-w-0 break-words">
                    <h3 className="font-bold text-sm leading-tight text-white drop-shadow-md">{version === 'english' ? (subject.name_en || subject.name) : (subject.name_bn || subject.name)}</h3>
                    <p className="text-[10px] font-medium text-white/70 mt-0.5 drop-shadow-md">{moduleCount}টি মডিউল</p>
                </div>

                <div className="flex items-center justify-end">
                    <div className="flex items-center gap-1.5 w-full max-w-[5.5rem]">
                        <div className="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full rounded-full bg-primary"
                                initial={{ width: 0 }}
                                animate={{ width: `${pct}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                            />
                        </div>
                        <span className="text-[10px] font-bold tabular-nums text-white/80 w-8 text-right shrink-0">{pct}%</span>
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
            className={`relative rounded-2xl border-2 transition-all ${
                hasQuestions
                    ? 'bg-surface border hover:border-primary/40'
                    : 'bg-eel/50 border opacity-50'
            }`}
        >
            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${
                    hasQuestions ? 'bg-primary/15 text-primary' : 'bg-eel text-hare/50'
                }`}>
                    {padIndex}
                </div>

                <div className="min-w-0">
                    <h4 className={`font-bold text-sm leading-tight truncate ${
                        hasQuestions ? 'text-text' : 'text-text-muted/50'
                    }`}>{cleanName}</h4>
                    {hasQuestions ? (
                        <p className="text-[10px] font-medium text-hare mt-0.5">{questionCount}টি প্রশ্ন</p>
                    ) : (
                        <p className="text-[10px] font-medium text-hare/40 mt-0.5">শীঘ্রই আসছে</p>
                    )}
                    {hasQuestions && (
                        <div className="flex items-center gap-2 mt-2">
                            <div className="flex-1 h-1.5 bg-eel rounded-full overflow-hidden max-w-[7rem]">
                                <motion.div
                                    className="h-full rounded-full bg-primary"
                                    initial={{ width: 0 }}
                                    animate={{ width: `${pct}%` }}
                                    transition={{ duration: 0.6, ease: 'easeOut' }}
                                />
                            </div>
                            <span className="text-[10px] font-bold tabular-nums text-primary w-7 text-right shrink-0">{pct}%</span>
                        </div>
                    )}
                </div>

                {hasQuestions && (
                    <button
                        onClick={() => onClick(chapter, cleanName)}
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-white font-bold rounded-full hover:bg-primary-hover transition-all text-xs active:scale-95 shrink-0"
                    >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        শুরু করো
                    </button>
                )}
            </div>
        </motion.div>
    );
};
