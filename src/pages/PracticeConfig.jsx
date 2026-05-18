import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Book, Calculator, Brain, ChevronRight, Play, Timer, ShieldCheck, ArrowRight, BookOpen, Sparkles, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, CheckList } from '../components/Illustrations';
import LottieAnimation from '../components/LottieAnimation';
import targetAnimation from '../assets/target.json';
import meditatingBrainAnimation from '../assets/meditating-brain.json';
import { api } from '../services/api';
import LoadingScreen from '../components/LoadingScreen';

const icons = {
    english: Book,
    math: Calculator,
    analytical: Brain,
};

const examColors = {
    ssc: { accent: '#10b981', bg: 'rgba(16,185,129,0.08)', label: 'SSC' },
    hsc: { accent: '#0ea5e9', bg: 'rgba(14,165,233,0.08)', label: 'HSC' },
    iba: { accent: '#8b5cf6', bg: 'rgba(139,92,246,0.08)', label: 'IBA' },
    bcs: { accent: '#f59e0b', bg: 'rgba(245,158,11,0.08)', label: 'BCS' },
    class7: { accent: '#f43f5e', bg: 'rgba(244,63,94,0.08)', label: 'Class 7' },
};

const fadeUp = {
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -16 }
};

const stagger = {
    animate: { transition: { staggerChildren: 0.07 } }
};

const cardSlide = {
    initial: { opacity: 0, y: 16, scale: 0.97 },
    animate: { opacity: 1, y: 0, scale: 1 }
};

const steps = [
    { key: 'exam', label: 'Exam' },
    { key: 'subject', label: 'Subject' },
    { key: 'lessons', label: 'Chapters' },
];

const ProgressBar = ({ completed, total, color }) => {
    if (total === 0) return null;
    const pct = Math.min(Math.round((completed / total) * 100), 100);
    const barColor = color || '#5e6ad2';
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

const ExamCard = ({ exam, isSelected, onClick, progress }) => {
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
                            Active
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
                    {isSelected ? 'Open' : 'Start'}
                </span>
            </div>
        </motion.button>
    );
};

const InactiveExam = ({ exam }) => {
    const colors = examColors[exam.id] || examColors.ssc;
    return (
        <div className="relative flex items-center gap-3 p-3.5 rounded-xl border border-white/[0.06] opacity-40 cursor-not-allowed bg-white/[0.02]">
            <div className="absolute left-0 top-2.5 bottom-2.5 w-[3px] rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.06)' }} />
            <div className="flex-1 min-w-0 pl-3">
                <div className="flex items-center gap-2">
                    <h3 className="text-xl md:text-2xl font-black text-white/50 tracking-tight leading-none">{exam.label}</h3>
                    <span className="text-[7px] font-black uppercase tracking-[0.2em] px-1.5 py-0.5 rounded bg-white/5 text-white/15">Soon</span>
                </div>
                <p className="text-[11px] text-white/15 font-medium mt-0.5">{exam.note}</p>
            </div>
        </div>
    );
};

const SubjectCard = ({ subject, isSelected, onClick, progress, version }) => {
    const Icon = icons[subject.id] || Book;
    const moduleCount = subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0) || 0;
    const pct = progress.total > 0 ? Math.min(Math.round((progress.completed / progress.total) * 100), 100) : 0;

    return (
        <motion.button
            onClick={onClick}
            whileTap={{ scale: 0.98 }}
            className={`relative w-full text-left rounded-xl border transition-all group ${
                isSelected
                    ? 'bg-primary/12 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
                    : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/[0.03]'
            }`}
        >
            {isSelected && (
                <div className="absolute top-0 right-0 p-2 bg-primary/20 text-primary rounded-bl-xl z-10">
                    <ShieldCheck className="w-3 h-3" />
                </div>
            )}

            <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3 p-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                    isSelected ? 'bg-primary text-black' : 'bg-surface-alt text-white/30 group-hover:text-white/50'
                }`}>
                    <Icon className="w-5 h-5" />
                </div>

                <div className="min-w-0 break-words">
                    <h3 className={`font-black tracking-tight text-sm leading-tight ${
                        isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>{version === 'english' ? (subject.name_en || subject.name) : (subject.name_bn || subject.name)}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 mt-0.5">{moduleCount} MODULES</p>
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

const ChapterItem = ({ chapter, topic, onClick, questionCount, completedCount, index, version }) => {
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
                        <p className="text-[10px] font-bold text-primary/60 mt-0.5">{questionCount} Questions</p>
                    ) : (
                        <p className="text-[10px] font-bold text-white/15 mt-0.5">Coming Soon</p>
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
                        className="flex items-center gap-1.5 px-4 py-2.5 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all text-[9px] shadow-lg shadow-primary/10 active:scale-95 shrink-0"
                    >
                        <Play className="w-3 h-3 fill-current" />
                        Start
                    </button>
                )}
            </div>
        </motion.div>
    );
};

const PracticeConfig = () => {
    const navigate = useNavigate();
    const { user, profile } = useAuth();
    const [data, setData] = useState({ exams: [] });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [isTimed, setIsTimed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterQuestionCounts, setChapterQuestionCounts] = useState({});
    const [chapterCompletedCounts, setChapterCompletedCounts] = useState({});

    const [searchParams] = useSearchParams();
    const categoryFilter = (searchParams.get('exam') || searchParams.get('category') || '').toLowerCase();

    const version = profile?.question_version || 'bangla';
    const versionLabel = version === 'english' ? 'English' : 'Bangla';

    const getChapterFile = (chapter) => {
        if (!chapter) return null;
        if (version === 'english') return chapter.file_en || chapter.file || chapter.file_bn || null;
        return chapter.file_bn || chapter.file || chapter.file_en || null;
    };

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';
        const examCatalog = [
            { id: 'ssc', label: 'SSC', note: 'NCTB English 1st and 2nd Paper' },
            { id: 'hsc', label: 'HSC', note: 'NCTB English 1st and 2nd Paper' },
            { id: 'iba', label: 'IBA', note: 'Admission English, Math, Analytical' },
            { id: 'bcs', label: 'BCS', note: 'Competitive exam practice' },
            { id: 'class7', label: 'Class 7', note: 'English Grammar' }
        ];

        Promise.all(examCatalog.map(exam =>
            fetch(`${base}${exam.id}/index.json`)
                .then(r => r.ok ? r.json().then(j => ({ exam, json: j })) : null)
                .catch(() => null)
        ))
            .then(results => {
                const exams = results.filter(Boolean).map(({ exam, json }) => {
                    const subjects = (json.subjects || []).map(sub => ({ ...sub, exam_category: exam.id.toUpperCase() }));
                    return { ...exam, active: true, subjects };
                });

                const inactiveExams = examCatalog
                    .filter(exam => !exams.some(e => e.id === exam.id))
                    .map(exam => ({ ...exam, active: false, subjects: [] }));

                const allExams = [...exams, ...inactiveExams];
                setData({ exams: allExams });

                const requested = allExams.find(exam => exam.id === categoryFilter && exam.active);
                const initialExam = requested || null;
                setSelectedExam(initialExam);
                setSelectedSubject(null);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setError(err.message);
                setLoading(false);
            });
    }, [categoryFilter]);

    useEffect(() => {
        const base = import.meta.env.BASE_URL || '/';

        const countChapterQuestions = async (chapterFile) => {
            if (!chapterFile) return 0;
            try {
                const path = chapterFile.startsWith('/') ? `${base}${chapterFile.slice(1)}` : chapterFile;
                const res = await fetch(path);
                if (!res.ok) return 0;
                const payload = await res.json();
                if (Array.isArray(payload?.chapters)) {
                    return payload.chapters.reduce((total, ch) => {
                        const c = ch.content || {};
                        if (Array.isArray(c.questions)) return total + c.questions.length;
                        if (Array.isArray(c.mcqQuestions)) return total + c.mcqQuestions.length;
                        if (Array.isArray(c.valid_sentences)) return total + c.valid_sentences.length;
                        if (Array.isArray(c.sentences)) return total + c.sentences.length;
                        if (c.gapFill?.blanks) return total + c.gapFill.blanks.length + (c.vocabQuestions?.length || 0);
                        if (Array.isArray(c.vocabQuestions)) return total + c.vocabQuestions.length;
                        return total;
                    }, 0);
                }
                const sourceQuestions = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.questions)
                        ? payload.questions
                        : Array.isArray(payload?.passages)
                            ? payload.passages
                            : [];
                if (Array.isArray(sourceQuestions) && sourceQuestions.length > 0 && Array.isArray(sourceQuestions[0].items)) {
                    return sourceQuestions.reduce((total, set) => total + (set.items?.length || 0), 0);
                }
                return sourceQuestions.reduce((total, question) => {
                    if (Array.isArray(question.blanks) && question.blanks.length > 0) {
                        return total + question.blanks.length;
                    }
                    return total + 1;
                }, 0);
            } catch {
                return 0;
            }
        };

        const hydrateChapterCounts = async () => {
            const chapterEntries = (data.exams || [])
                .flatMap((exam) => exam.subjects || [])
                .flatMap((subject) => subject.topics || [])
                .flatMap((topic) => topic.chapters || [])
                .map((chapter) => ({ chapter, file: getChapterFile(chapter) }))
                .filter((entry) => Boolean(entry.file));

            if (chapterEntries.length === 0) {
                setChapterQuestionCounts({});
                return;
            }

            const pairs = await Promise.all(
                chapterEntries.map(async ({ file }) => [file, await countChapterQuestions(file)])
            );

            setChapterQuestionCounts(Object.fromEntries(pairs));
        };

        hydrateChapterCounts();
    }, [data, version]);

    useEffect(() => {
        if (!user?.id) return;
        (async () => {
            const { data: responses } = await api.getUserResponses(user.id);
            if (!responses) return;
            const seen = new Set();
            const completed = {};
            responses.forEach(r => {
                const file = r.source_file;
                const qid = r.question_id;
                if (!file || !qid) return;
                const key = `${file}_${qid}`;
                if (seen.has(key)) return;
                seen.add(key);
                completed[file] = (completed[file] || 0) + 1;
            });
            setChapterCompletedCounts(completed);
        })();
    }, [user?.id]);

    const getSubjectProgress = (subject) => {
        let completed = 0, total = 0;
        (subject.topics || []).forEach(topic => {
            (topic.chapters || []).forEach(chapter => {
                const file = getChapterFile(chapter);
                if (file) {
                    completed += chapterCompletedCounts[file] || 0;
                    total += chapterQuestionCounts[file] || 0;
                }
            });
        });
        return { completed, total };
    };

    const getExamProgress = (exam) => {
        let completed = 0, total = 0;
        (exam.subjects || []).forEach(subject => {
            const p = getSubjectProgress(subject);
            completed += p.completed;
            total += p.total;
        });
        return { completed, total };
    };

    const step = selectedExam && selectedSubject ? 2 : selectedExam ? 1 : 0;
    const goToStep = (s) => {
        if (s === 0) { setSelectedSubject(null); setSelectedExam(null); }
        else if (s === 1) { setSelectedSubject(null); }
    };

    const handleStart = (chapter, displayName) => {
        const file = getChapterFile(chapter);
        if (chapter._type === 'model_test') {
            navigate(`/quiz/${chapter.id}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}&chapterId=${chapter.id}`);
        } else {
            navigate(`/levels?file=${encodeURIComponent(file)}&title=${encodeURIComponent(displayName || chapter.name)}&chapterId=${chapter.id}`);
        }
    };

    if (loading) return <LoadingScreen message="Getting ready..." />;

    if (error) return (
        <div className="p-6 md:p-10 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl md:rounded-[2rem] flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-yellow-500/10 rounded-full">
                <Sparkles className="w-8 h-8 md:w-10 md:h-10 text-yellow-300" />
            </div>
            <div>
                <h3 className="text-white font-black text-lg md:text-xl tracking-tighter">Path paused for now</h3>
                <p className="text-yellow-100/70 text-sm max-w-sm mx-auto mt-2 font-medium">{error}. We couldn't load the lessons.</p>
            </div>
        </div>
    );

    return (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="max-w-3xl mx-auto space-y-6">
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="relative overflow-hidden rounded-3xl bg-surface p-6 shadow-2xl shadow-black/30 flex flex-col md:flex-row md:items-end justify-between gap-3"
            >
                <div className="absolute -top-8 -right-8 w-36 h-36 opacity-[0.06] pointer-events-none">
                    <LottieAnimation src={targetAnimation} className="w-full h-full" pingPong />
                </div>
                <div className="min-w-0 flex-1 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, x: -12 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.05, duration: 0.3 }}
                        className="text-2xl md:text-5xl font-black text-white tracking-tighter mb-1 md:mb-2"
                    >
                        LET'S <span className="text-primary">PRACTICE!</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.12 }}
                        className="text-white/30 font-bold uppercase tracking-widest text-[9px] md:text-[10px]"
                    >
                        Your progress is being saved locally for testing.
                    </motion.p>
                    {selectedExam && (
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.18 }}
                            className="mt-1 text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-primary/70 truncate"
                        >
                            Exam: {selectedExam.label} &bull; Version: {versionLabel}
                        </motion.p>
                    )}
                </div>
                <motion.div
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                    className="bg-surface border border-white/5 p-0.5 md:p-1 rounded-lg md:rounded-xl flex items-center gap-0.5 md:gap-1 shadow-lg self-start md:self-end shrink-0 relative z-10"
                >
                    <button onClick={() => setIsTimed(false)} className={`flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${!isTimed ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}>
                        Untimed
                    </button>
                    <button onClick={() => setIsTimed(true)} className={`flex items-center gap-1 md:gap-2 px-2.5 md:px-4 py-2 md:py-2.5 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${isTimed ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}>
                        <Timer className="w-3 h-3" />
                        Timed
                    </button>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.25 }}
                className="flex items-center gap-1 md:gap-2 text-[10px] font-black uppercase tracking-[0.15em] py-2.5 md:py-3 px-3 md:px-4 bg-surface border border-white/5 rounded-xl overflow-x-auto no-scrollbar"
            >
                {steps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        {i > 0 && <ChevronRight className="w-3 h-3 text-white/15" />}
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 + i * 0.06 }}
                            onClick={() => goToStep(i)}
                            disabled={i > step}
                            className={`flex items-center gap-1.5 transition-all px-2 py-1 rounded-lg ${i === step
                                ? 'text-primary bg-primary/10'
                                : i < step
                                    ? 'text-white/40 hover:text-white/60 cursor-pointer'
                                    : 'text-white/15 cursor-not-allowed'
                                }`}
                        >
                            {i < step && <Check className="w-2.5 h-2.5" />}
                            {s.label}
                        </motion.button>
                    </React.Fragment>
                ))}
                {selectedSubject && (
                    <span className="text-white/20 ml-auto hidden sm:inline text-[9px] truncate max-w-[120px] md:max-w-[200px]">
                        {selectedExam?.label} · {version === 'english' ? (selectedSubject.name_en || selectedSubject.name) : (selectedSubject.name_bn || selectedSubject.name)}
                    </span>
                )}
            </motion.div>

            <AnimatePresence mode="wait">
                {step === 0 && (
                    <motion.div key="step-exam" variants={fadeUp} initial="initial" animate="animate" exit="exit" transition={{ duration: 0.25 }} className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h2 className="text-sm font-black text-white/50 uppercase tracking-[0.2em] flex items-center gap-2">
                                    <BookOpen className="text-primary w-4 h-4" />
                                    Choose Your Exam
                                </h2>
                                <p className="text-[10px] text-white/20 font-medium mt-0.5">Pick an exam to start practicing</p>
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 bg-white/5 px-2.5 py-1 rounded-lg">{data.exams.filter(e => e.active).length} Active</span>
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
                            <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BookOpen className="text-primary w-4 h-4" />
                                {selectedExam.label} SUBJECTS
                            </h2>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{selectedExam.subjects?.length || 0} subjects</span>
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
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="p-6 rounded-2xl border border-white/5 bg-surface text-center flex flex-col items-center gap-4">
                                <div className="w-12 h-12 opacity-40">
                                    <LottieAnimation src={targetAnimation} className="w-full h-full" pingPong />
                                </div>
                                <p className="text-white/50 text-sm font-medium">No questions are available for this exam yet.</p>
                            </motion.div>
                        )}
                        {step === 1 && (
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
                                <button onClick={() => goToStep(0)} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors mt-2">
                                    ← Back to exams
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
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em]"
                        >
                            <span className="text-white/30">{selectedExam.label}</span>
                            <span className="text-white/10">/</span>
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
                                                <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">{version === 'english' ? (topic.name_en || topic.name) : (topic.name_bn || topic.name)}</span>
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
                                                    className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3"
                                                >
                                                    <div className="w-12 h-12 opacity-40">
                                                        <LottieAnimation src={meditatingBrainAnimation} className="w-full h-full" pingPong />
                                                    </div>
                                                    <p className="text-xs text-white/10 font-black uppercase tracking-widest">Chapters Coming Soon!</p>
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
                            <button onClick={() => goToStep(1)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                                ← Subjects
                            </button>
                            <button onClick={() => goToStep(0)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                                ← Exams
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default PracticeConfig;
