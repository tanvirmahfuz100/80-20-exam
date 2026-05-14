import React, { useState, useEffect } from 'react';
import { Book, Calculator, Brain, ChevronRight, Play, Clock, Timer, ShieldCheck, ArrowRight, BookOpen, Sparkles } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const SubjectCard = ({ subject, isSelected, onClick }) => {
    const Icon = {
        english: Book,
        math: Calculator,
        analytical: Brain
    }[subject.id] || Book;

    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center justify-center p-8 rounded-[2rem] border transition-all duration-300 w-full text-center relative overflow-hidden group ${isSelected
                ? 'bg-primary/12 border-primary shadow-[0_0_40px_rgba(88,199,79,0.18)] -translate-y-1'
                : 'bg-surface border-white/5 hover:border-primary/30 hover:bg-white/5'
                }`}
        >
            {isSelected && <div className="absolute top-0 right-0 p-3 bg-primary/20 text-primary rounded-bl-2xl">
                <ShieldCheck className="w-4 h-4" />
            </div>}
            <div className={`p-5 rounded-[1.5rem] mb-5 transition-all duration-500 ${isSelected ? 'bg-primary text-black scale-110 shadow-lg shadow-primary/25' : 'bg-surface-alt text-white/20 group-hover:text-white/40'}`}>
                <Icon className="w-10 h-10" />
            </div>
            <h3 className={`text-xl font-black mb-1 transition-colors tracking-tighter ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white'}`}>{subject.name}</h3>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/20">{subject.topics?.reduce((acc, t) => acc + t.chapters.length, 0)} Modules</p>
        </button>
    );
};

const ChapterItem = ({ chapter, onClick, questionCount }) => (
    <div className="flex items-center justify-between p-5 bg-surface border border-white/5 rounded-[1.6rem] hover:border-primary/30 transition-all group hover:bg-white/5">
        <div className="flex-1 min-w-0 pr-4">
            <h4 className="font-bold text-white text-lg truncate group-hover:text-primary transition-colors leading-tight mb-1">{chapter.name}</h4>
            <div className="flex items-center gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white/20 italic">Learning Goal</span>
                <span className="w-1 h-1 rounded-full bg-white/10"></span>
                <span className="text-[10px] font-black uppercase tracking-[0.1em] text-primary/50">{questionCount} Questions</span>
            </div>
        </div>
        <button
            onClick={() => onClick(chapter)}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black uppercase tracking-widest rounded-2xl hover:bg-primary-hover transition-all text-[10px] shadow-lg shadow-primary/10 active:scale-95 shrink-0"
        >
            <Play className="w-4 h-4 fill-current" />
            Start
        </button>
    </div>
);

const PracticeConfig = () => {
    const navigate = useNavigate();
    const { profile } = useAuth();
    const [data, setData] = useState({ exams: [] });
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [selectedExam, setSelectedExam] = useState(null);
    const [isTimed, setIsTimed] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [chapterQuestionCounts, setChapterQuestionCounts] = useState({});

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

                const availableExams = allExams.filter(exam => exam.active);
                const requested = allExams.find(exam => exam.id === categoryFilter && exam.active);
                const initialExam = requested || availableExams[0] || null;
                setSelectedExam(initialExam);
                setSelectedSubject(initialExam?.subjects?.[0] || null);
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
                chapterEntries.map(async ({ chapter, file }) => [file, await countChapterQuestions(file)])
            );

            setChapterQuestionCounts(Object.fromEntries(pairs));
        };

        hydrateChapterCounts();
    }, [data, version]);

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
        <div className="p-10 bg-yellow-500/10 border border-yellow-500/20 rounded-[2rem] flex flex-col items-center gap-4 text-center">
            <div className="p-4 bg-yellow-500/10 rounded-full">
                <Sparkles className="w-10 h-10 text-yellow-300" />
            </div>
            <div>
                <h3 className="text-white font-black text-xl italic tracking-tighter">Path paused for now</h3>
                <p className="text-yellow-100/70 text-sm max-w-sm mx-auto mt-2 font-medium">{error}. We couldn't load the lessons.</p>
            </div>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                    <h1 className="text-5xl md:text-6xl font-black text-white italic tracking-tighter mb-4">
                        LET'S <span className="text-primary not-italic uppercase">PRACTICE!</span>
                    </h1>
                    <p className="text-white/30 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2">
                        Your progress is being saved locally for testing.
                    </p>
                    {selectedExam && (
                        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-primary/70">
                            Exam: {selectedExam.label} · Version: {versionLabel}
                        </p>
                    )}
                </div>

                {/* Timed Toggle */}
                <div className="bg-surface border border-white/5 p-2 rounded-[1.8rem] flex items-center gap-2 shadow-2xl overflow-hidden">
                    <button
                        onClick={() => setIsTimed(false)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${!isTimed ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}
                    >
                        Untimed
                    </button>
                    <button
                        onClick={() => setIsTimed(true)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest transition-all ${isTimed ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-white/20 hover:text-white/40'}`}
                    >
                        <Timer className="w-4 h-4" />
                        Timed Mode
                    </button>
                </div>
            </div>

            {/* Exam Selector */}
                <div className="space-y-5">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                        <BookOpen className="text-primary w-6 h-6" />
                        PICK AN EXAM
                    </h2>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">SSC / HSC / IBA / BCS</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
                    {(data.exams || []).map(exam => (
                        exam.active ? (
                            <button
                                key={exam.id}
                                onClick={() => {
                                    setSelectedExam(exam);
                                    setSelectedSubject(exam.subjects?.[0] || null);
                                }}
                                className={`text-left rounded-[2rem] p-6 border transition-all bg-surface hover:border-primary/40 ${selectedExam?.id === exam.id ? 'border-primary shadow-[0_0_40px_rgba(88,199,79,0.15)] -translate-y-1' : 'border-white/5'}`}
                            >
                                <div className="flex items-start justify-between gap-4 mb-6">
                                    <div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60 mb-2">Active</p>
                                        <h3 className="text-3xl font-black text-white italic tracking-tighter">{exam.label}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-white/30 text-sm leading-relaxed font-medium">{exam.note}</p>
                            </button>
                        ) : (
                            <div key={exam.id} className="rounded-[2rem] p-6 border border-white/5 bg-surface opacity-60">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Coming soon</p>
                                <h3 className="text-3xl font-black text-white italic tracking-tighter mb-4">{exam.label}</h3>
                                <p className="text-white/20 text-sm leading-relaxed font-medium">{exam.note}</p>
                            </div>
                        )
                    ))}
                </div>
            </div>

            {/* Subject Selector */}
            {selectedExam && (
                <div className="space-y-5">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-black text-white italic tracking-tighter flex items-center gap-3">
                            <BookOpen className="text-primary w-6 h-6" />
                            {selectedExam.label} SUBJECTS
                        </h2>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">{selectedExam.subjects?.length || 0} subjects</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {selectedExam.subjects.map(sub => (
                            <SubjectCard
                                key={`${selectedExam.id}_${sub.id}`}
                                subject={sub}
                                isSelected={selectedSubject?.id === sub.id}
                                onClick={() => setSelectedSubject(sub)}
                            />
                        ))}
                    </div>
                    {selectedExam.subjects.length === 0 && (
                        <div className="p-8 rounded-3xl border border-white/5 bg-surface text-center">
                            <p className="text-white/50 text-sm font-medium">No questions are available for this exam yet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Chapters Grid */}
            {selectedSubject && (
                <div className="space-y-10 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4">
                        <div className="h-px flex-1 bg-white/5"></div>
                        <div className="px-6 py-2 bg-white/5 rounded-full border border-white/5">
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Choose a Lesson</span>
                        </div>
                        <div className="h-px flex-1 bg-white/5"></div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-1 gap-12">
                        {selectedSubject.topics.map(topic => (
                            <div key={topic.id} className="space-y-6">
                                <div className="flex items-center gap-3">
                                    <h3 className="text-2xl font-black text-white/90 italic tracking-tight uppercase">{topic.name}</h3>
                                    <span className="flex-1 h-px bg-primary/20 shadow-[0_0_10px_rgba(94,106,210,0.1)]"></span>
                                    <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">{topic.chapters.length} Units</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {topic.chapters.length > 0 ? (
                                        topic.chapters.map(chapter => (
                                            <ChapterItem
                                                key={chapter.id}
                                                chapter={chapter}
                                                onClick={handleStart}
                                                questionCount={chapterQuestionCounts[getChapterFile(chapter)] ?? 0}
                                            />
                                        ))
                                    ) : (
                                        <div className="col-span-2 py-10 text-center border-2 border-dashed border-white/5 rounded-3xl">
                                            <p className="text-xs text-white/10 font-black uppercase tracking-widest">Lessons Coming Soon!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PracticeConfig;
