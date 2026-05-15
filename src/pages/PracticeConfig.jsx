import React, { useState, useEffect } from 'react';
import { Book, Calculator, Brain, ChevronRight, Play, Timer, ShieldCheck, ArrowRight, BookOpen, Sparkles, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Target, CheckList } from '../components/Illustrations';
import { api } from '../services/api';

const icons = {
    english: Book,
    math: Calculator,
    analytical: Brain,
};

const steps = [
    { key: 'exam', label: 'Exam' },
    { key: 'subject', label: 'Subject' },
    { key: 'lessons', label: 'Chapters' },
];

const ProgressBar = ({ completed, total }) => {
    if (total === 0) return null;
    const pct = Math.min(Math.round((completed / total) * 100), 100);
    return (
        <div className="flex items-center gap-2.5 w-full">
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[9px] font-bold text-white/30 whitespace-nowrap tabular-nums">{completed}/{total}</span>
        </div>
    );
};

const ExamCard = ({ exam, isSelected, onClick, progress }) => (
    <button onClick={onClick} className={`relative flex flex-col gap-3 px-5 py-4 rounded-xl border transition-all text-left ${isSelected
        ? 'bg-primary/12 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
        : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/5'
        }`}>
        <div className="flex items-center gap-4">
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-black uppercase tracking-[0.2em] ${isSelected ? 'text-primary/60' : 'text-white/20'}`}>
                        {isSelected ? 'Selected' : 'Select'}
                    </span>
                    {isSelected && <ShieldCheck className="w-3 h-3 text-primary" />}
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">{exam.label}</h3>
                <p className="text-xs text-white/30 font-medium mt-0.5">{exam.note}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-primary text-black' : 'bg-white/5 text-white/20'}`}>
                <ArrowRight className="w-4 h-4" />
            </div>
        </div>
        <ProgressBar completed={progress.completed} total={progress.total} />
    </button>
);

const InactiveExam = ({ exam }) => (
    <div className="flex items-center gap-4 px-5 py-4 rounded-xl border border-white/5 bg-surface opacity-50 cursor-not-allowed">
        <div className="flex-1 min-w-0">
            <span className="text-xs font-black uppercase tracking-[0.2em] text-white/20">Coming soon</span>
            <h3 className="text-xl font-black text-white tracking-tight">{exam.label}</h3>
            <p className="text-xs text-white/20 font-medium mt-0.5">{exam.note}</p>
        </div>
    </div>
);

const SubjectCard = ({ subject, isSelected, onClick, progress }) => {
    const Icon = icons[subject.id] || Book;
    const moduleCount = subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0) || 0;

    return (
        <button onClick={onClick} className={`flex flex-col gap-3 px-5 py-4 rounded-xl border transition-all text-left relative ${isSelected
            ? 'bg-primary/12 border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/30'
            : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/5'
            }`}>
            {isSelected && (
                <div className="absolute top-0 right-0 p-2 bg-primary/20 text-primary rounded-bl-xl">
                    <ShieldCheck className="w-3 h-3" />
                </div>
            )}
            <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl shrink-0 transition-all ${isSelected ? 'bg-primary text-black' : 'bg-surface-alt text-white/30'}`}>
                    <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-black tracking-tight ${isSelected ? 'text-white' : 'text-white/60'}`}>{subject.name}</h3>
                    <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/20 mt-0.5">{moduleCount} Modules</p>
                </div>
            </div>
            <ProgressBar completed={progress.completed} total={progress.total} />
        </button>
    );
};

const ChapterItem = ({ chapter, onClick, questionCount, completedCount }) => {
    const hasQuestions = questionCount > 0;
    return (
        <div className="flex flex-col gap-2.5 p-4 bg-surface border border-white/5 rounded-xl hover:border-primary/30 transition-all hover:bg-white/5 active:scale-[0.99]">
            <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-3">
                    <h4 className="font-bold text-white text-sm truncate leading-tight mb-1">{chapter.name}</h4>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20">Learning Goal</span>
                        <span className="w-1 h-1 rounded-full bg-white/10"></span>
                        {hasQuestions ? (
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-primary/50">{questionCount} Questions</span>
                        ) : (
                            <span className="text-[9px] font-black uppercase tracking-[0.1em] text-white/15">Coming Soon</span>
                        )}
                    </div>
                </div>
                {hasQuestions && (
                    <button onClick={() => onClick(chapter)} className="flex items-center gap-2 px-4 py-2.5 bg-primary text-black font-black uppercase tracking-widest rounded-xl hover:bg-primary-hover transition-all text-[9px] shadow-lg shadow-primary/10 active:scale-95 shrink-0">
                        <Play className="w-3 h-3 fill-current" />
                        Start
                    </button>
                )}
            </div>
            {hasQuestions && <ProgressBar completed={completedCount} total={questionCount} />}
        </div>
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
            { id: 'bcs', label: 'BCS', note: 'Competitive exam practice' }
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
                const sourceQuestions = Array.isArray(payload)
                    ? payload
                    : Array.isArray(payload?.questions)
                        ? payload.questions
                        : Array.isArray(payload?.passages)
                            ? payload.passages
                            : [];
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

    const handleStart = (chapter) => {
        const file = getChapterFile(chapter);
        navigate(`/quiz/${chapter.id}?file=${encodeURIComponent(file)}&title=${encodeURIComponent(chapter.name)}&timed=${isTimed}`);
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-white/20 font-black uppercase tracking-[0.3em] text-[10px]">Getting ready...</p>
        </div>
    );

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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
                        LET'S <span className="text-primary">PRACTICE!</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px]">
                        Your progress is being saved locally for testing.
                    </p>
                    {selectedExam && (
                        <p className="mt-1.5 text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                            Exam: {selectedExam.label} &bull; Version: {versionLabel}
                        </p>
                    )}
                </div>
                <div className="bg-surface border border-white/5 p-1 rounded-xl flex items-center gap-1 shadow-lg">
                    <button onClick={() => setIsTimed(false)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${!isTimed ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}>
                        Untimed
                    </button>
                    <button onClick={() => setIsTimed(true)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${isTimed ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}>
                        <Timer className="w-3 h-3" />
                        Timed Mode
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] py-3 px-4 bg-surface border border-white/5 rounded-xl">
                {steps.map((s, i) => (
                    <React.Fragment key={s.key}>
                        {i > 0 && <ChevronRight className="w-3 h-3 text-white/15" />}
                        <button
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
                        </button>
                    </React.Fragment>
                ))}
                {selectedSubject && (
                    <span className="text-white/20 ml-auto hidden sm:inline text-[9px]">
                        {selectedExam?.label} · {selectedSubject.name}
                    </span>
                )}
            </div>

            {step === 0 && (
                <div className="space-y-3">
                    <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                        <BookOpen className="text-primary w-4 h-4" />
                        SELECT EXAM
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {(data.exams || []).map(exam =>
                            exam.active ? (
                                <ExamCard
                                    key={exam.id}
                                    exam={exam}
                                    isSelected={selectedExam?.id === exam.id}
                                    onClick={() => {
                                        setSelectedExam(exam);
                                        setSelectedSubject(null);
                                    }}
                                    progress={getExamProgress(exam)}
                                />
                            ) : (
                                <InactiveExam key={exam.id} exam={exam} />
                            )
                        )}
                    </div>
                </div>
            )}

            {step === 1 && selectedExam && (
                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-black text-white/40 uppercase tracking-[0.2em] flex items-center gap-2">
                            <BookOpen className="text-primary w-4 h-4" />
                            {selectedExam.label} SUBJECTS
                        </h2>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{selectedExam.subjects?.length || 0} subjects</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {selectedExam.subjects.map(sub => (
                            <SubjectCard
                                key={`${selectedExam.id}_${sub.id}`}
                                subject={sub}
                                isSelected={selectedSubject?.id === sub.id}
                                onClick={() => setSelectedSubject(sub)}
                                progress={getSubjectProgress(sub)}
                            />
                        ))}
                    </div>
                    {selectedExam.subjects.length === 0 && (
                        <div className="p-6 rounded-2xl border border-white/5 bg-surface text-center flex flex-col items-center gap-4">
                            <Target className="w-12 h-12 opacity-20" />
                            <p className="text-white/50 text-sm font-medium">No questions are available for this exam yet.</p>
                        </div>
                    )}
                    {step === 1 && (
                        <button onClick={() => goToStep(0)} className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20 hover:text-white/40 transition-colors mt-2">
                            ← Back to exams
                        </button>
                    )}
                </div>
            )}

            {step === 2 && selectedSubject && (
                <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-3 px-4 py-3 bg-primary/8 border border-primary/15 rounded-xl">
                        <div className="w-1 h-6 bg-primary rounded-full shrink-0"></div>
                        <p className="text-sm font-bold text-white/80">
                            <span className="text-primary">{selectedSubject.name}</span>
                            {' · '}
                            {selectedSubject.topics.map(t => t.name).join(', ')}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {selectedSubject.topics.map(topic => (
                            <div key={topic.id} className="space-y-3">
                                <div className="flex items-center gap-3 px-4 py-3 bg-white/[0.02] border border-white/[0.04] rounded-xl">
                                    <div className="w-1 h-6 bg-primary rounded-full shrink-0"></div>
                                    <h3 className="text-base font-black text-white tracking-tight uppercase">{topic.name}</h3>
                                    <div className="flex-1"></div>
                                    <span className="text-[9px] font-black text-primary/40 uppercase tracking-widest shrink-0">{topic.chapters.length} Units</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {topic.chapters.length > 0 ? (
                                        topic.chapters.map(chapter => (
                                            <ChapterItem
                                                key={chapter.id}
                                                chapter={chapter}
                                                onClick={handleStart}
                                                questionCount={chapterQuestionCounts[getChapterFile(chapter)] ?? 0}
                                                completedCount={chapterCompletedCounts[getChapterFile(chapter)] ?? 0}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-8 text-center border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center gap-3">
                                            <CheckList className="w-12 h-12 opacity-20" />
                                            <p className="text-xs text-white/10 font-black uppercase tracking-widest">Chapters Coming Soon!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                        <button onClick={() => goToStep(1)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                            ← Subjects
                        </button>
                        <button onClick={() => goToStep(0)} className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-white/25 hover:text-white/50 transition-colors px-3 py-2 rounded-lg hover:bg-white/5">
                            ← Exams
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeConfig;
